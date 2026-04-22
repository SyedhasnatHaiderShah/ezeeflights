import type { NodeOptions } from '@sentry/nextjs';
import type { ErrorEvent, EventHint } from '@sentry/nextjs';

const SENSITIVE_KEYS = new Set([
  'password', 'currentpassword', 'newpassword',
  'token', 'refreshtoken',
  'apikey', 'api_key', 'secret', 'authorization',
  'cardnumber', 'cvv', 'cvc', 'creditcard',
]);

function scrubObject(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => scrubObject(item, depth + 1));
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : scrubObject(value, depth + 1);
  }
  return result;
}

export function buildServerSentryOptions(): NodeOptions | null {
  const dsn = process.env.SENTRY_DSN;
  const isDev = (process.env.NODE_ENV ?? 'development') === 'development';
  const enableInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV === 'true';

  if (!dsn || (isDev && !enableInDev)) return null;

  return {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    beforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
      if (event.request?.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event.request.data = scrubObject(event.request.data) as any;
      }
      if (event.request?.headers) {
        const h = { ...event.request.headers };
        if (h['authorization']) h['authorization'] = '[REDACTED]';
        if (h['cookie']) h['cookie'] = '[REDACTED]';
        event.request.headers = h;
      }
      return event;
    },
  };
}
