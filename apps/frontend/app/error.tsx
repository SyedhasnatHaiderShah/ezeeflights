'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorDisplay } from '@/components/error/error-display';
import { isApiError } from '@/lib/api/api-errors';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * App Router segment-level error boundary.
 * Catches unhandled errors thrown during rendering of any route under app/.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    const correlationId = isApiError(error) ? error.correlationId : null;
    Sentry.withScope((scope) => {
      if (correlationId) scope.setTag('correlationId', correlationId);
      if (error.digest) scope.setTag('next.digest', error.digest);
      Sentry.captureException(error);
    });
  }, [error]);

  const correlationId = isApiError(error) ? error.correlationId : null;

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <ErrorDisplay
        message={error.message}
        correlationId={correlationId}
        onRetry={reset}
        className="max-w-md w-full"
      />
    </div>
  );
}
