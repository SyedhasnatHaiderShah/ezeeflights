'use client';

import React, { Component } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorDisplay } from './error-display';
import { isApiError } from '@/lib/api/api-errors';

interface Props {
  children: React.ReactNode;
  /** Correlation ID from useCorrelationId().currentActionId — passed as prop so the class component can access it. */
  correlationId?: string | null;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  correlationId: string | null;
  message: string | null;
}

/**
 * Class-based React error boundary for use inside Client Component trees.
 * For App Router route-level errors, use app/error.tsx instead.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, correlationId: null, message: null };
  }

  static getDerivedStateFromError(error: unknown): State {
    const correlationId = isApiError(error) ? error.correlationId : null;
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, correlationId, message };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    const correlationId = this.props.correlationId ?? (isApiError(error) ? error.correlationId : null);
    Sentry.withScope((scope) => {
      if (correlationId) scope.setTag('correlationId', correlationId);
      scope.setExtra('componentStack', info.componentStack);
      Sentry.captureException(error);
    });
  }

  override render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <ErrorDisplay
        message={this.state.message ?? undefined}
        correlationId={this.state.correlationId ?? this.props.correlationId ?? null}
        onRetry={() => this.setState({ hasError: false, correlationId: null, message: null })}
      />
    );
  }
}
