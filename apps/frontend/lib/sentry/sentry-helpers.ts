import * as Sentry from '@sentry/nextjs';
import type { ApiError } from '@/lib/api/api-errors';

/**
 * Adds a breadcrumb under the 'user.journey' category.
 * Use this at key intent points: search initiated, booking started, payment submitted.
 */
export function addUserJourneyBreadcrumb(
  event: string,
  data: Record<string, unknown>,
  correlationId: string,
): void {
  Sentry.addBreadcrumb({
    category: 'user.journey',
    message: event,
    data: { ...data, correlationId },
    level: 'info',
    timestamp: Date.now() / 1000,
  });
  // Keep the tag fresh on the scope for any exception that follows.
  Sentry.setTag('correlationId', correlationId);
}

/**
 * Captures an ApiError in Sentry with full context.
 * Attaches correlationId as a tag so the event is searchable by trace ID.
 */
export function captureApiError(
  error: ApiError,
  context: Record<string, unknown>,
): void {
  Sentry.withScope((scope) => {
    if (error.correlationId) {
      scope.setTag('correlationId', error.correlationId);
    }
    scope.setTag('http.status_code', String(error.statusCode));
    scope.setExtra('apiError', {
      statusCode: error.statusCode,
      correlationId: error.correlationId,
      details: error.details,
    });
    scope.setExtra('context', context);
    Sentry.captureException(error);
  });
}
