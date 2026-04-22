// Next.js 15.3+ / 16 browser Sentry init — runs once in the browser bundle.
import * as Sentry from '@sentry/nextjs';

// Required by @sentry/nextjs v10+ to instrument client-side navigation.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
import type { ErrorEvent, EventHint, Breadcrumb } from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isDev = process.env.NODE_ENV === 'development';
const enableInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV === 'true';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || !local) return '[REDACTED]';
  return `${local[0]}***@${domain}`;
}

const SENSITIVE_KEYS = new Set([
  'password', 'currentpassword', 'newpassword',
  'token', 'refreshtoken',
  'apikey', 'api_key', 'secret', 'authorization',
  'cardnumber', 'cvv', 'cvc', 'creditcard',
]);

function scrubValue(key: string, value: unknown): unknown {
  const k = key.toLowerCase();
  if (SENSITIVE_KEYS.has(k)) return '[REDACTED]';
  if (k === 'email' && typeof value === 'string') return maskEmail(value);
  return value;
}

function scrubObject(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => scrubObject(item, depth + 1));
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = scrubValue(key, typeof value === 'object' ? scrubObject(value, depth + 1) : value);
  }
  return result;
}

if (dsn && (!isDev || enableInDev)) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

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

    beforeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
      // Scrub fetch/xhr breadcrumbs that may log request bodies.
      if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
        if (breadcrumb.data?.['request_body']) {
          breadcrumb.data['request_body'] = scrubObject(breadcrumb.data['request_body']);
        }
        // Strip auth headers logged by browser network panel.
        if (typeof breadcrumb.data?.['url'] === 'string' && breadcrumb.data['url'].includes('authorization')) {
          return null;
        }
      }
      return breadcrumb;
    },
  });
}
