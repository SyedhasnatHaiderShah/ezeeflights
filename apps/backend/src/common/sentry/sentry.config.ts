import type { NodeOptions } from '@sentry/nestjs';
import type { ErrorEvent, EventHint } from '@sentry/nestjs';

const SENSITIVE_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'token',
  'refreshtoken',
  'apikey',
  'api_key',
  'secret',
  'authorization',
  'cardnumber',
  'cvv',
  'cvc',
  'creditcard',
]);

function scrubObject(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObject(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : scrubObject(value, depth + 1);
  }
  return result;
}

export function buildSentryOptions(): NodeOptions {
  return {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,

    beforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
      // Scrub request body and headers
      if (event.request) {
        if (event.request.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event.request.data = scrubObject(event.request.data) as any;
        }
        if (event.request.headers) {
          const headers = { ...event.request.headers };
          if (headers['authorization']) headers['authorization'] = '[REDACTED]';
          if (headers['cookie']) headers['cookie'] = '[REDACTED]';
          event.request.headers = headers;
        }
      }

      // Scrub breadcrumb data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((crumb) => ({
          ...crumb,
          data: crumb.data ? (scrubObject(crumb.data) as Record<string, unknown>) : crumb.data,
        }));
      }

      return event;
    },
  };
}
