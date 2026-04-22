'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  message?: string;
  correlationId: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ message, correlationId, onRetry, className }: ErrorDisplayProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!correlationId) return;
    void navigator.clipboard.writeText(correlationId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center',
        className,
      )}
      role="alert"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-2xl">
        ✕
      </div>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {message ?? 'An unexpected error occurred. Please try again.'}
        </p>
      </div>

      {correlationId && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium">Reference:</span>
          <code className="font-mono">{correlationId}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="ml-1 rounded px-1.5 py-0.5 text-xs transition-colors hover:bg-muted-foreground/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Copy reference ID"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Try again
        </button>
      )}

      {correlationId && (
        <p className="text-xs text-muted-foreground/60">
          Share this reference with support to help us investigate.
        </p>
      )}
    </div>
  );
}
