'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { isApiError } from '@/lib/api/api-errors';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root-level error boundary — replaces the root layout on catastrophic failure.
 * Must include its own <html> and <body> tags per Next.js App Router spec.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const isChunkError =
    error.name === 'ChunkLoadError' ||
    error.message.includes('Failed to load chunk') ||
    error.message.includes('Loading chunk');

  useEffect(() => {
    if (isChunkError) {
      window.location.reload();
      return;
    }

    const correlationId = isApiError(error) ? error.correlationId : null;
    Sentry.withScope((scope) => {
      if (correlationId) scope.setTag('correlationId', correlationId);
      if (error.digest) scope.setTag('next.digest', error.digest);
      scope.setTag('boundary', 'global');
      Sentry.captureException(error);
    });
  }, [error, isChunkError]);

  const correlationId = isApiError(error) ? error.correlationId : null;

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-md w-full flex-col items-center gap-6 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="text-4xl">⚠️</div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">Application error</h1>
            <p className="text-sm text-gray-600">
              {error.message || 'A critical error occurred. Please refresh the page.'}
            </p>
          </div>
          {correlationId && (
            <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 font-mono break-all">
               {correlationId}
            </code>
          )}
          <button
            type="button"
            onClick={isChunkError ? () => window.location.reload() : reset}
            className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
