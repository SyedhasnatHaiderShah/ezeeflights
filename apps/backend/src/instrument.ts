// This file MUST be imported before any other module in main.ts.
// Sentry v10+ requires early initialization for auto-instrumentation to patch
// Node.js http, dns, and third-party SDK modules at startup time.
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { buildSentryOptions } from './common/sentry/sentry.config';

const dsn = process.env.SENTRY_DSN;
const isDev = (process.env.NODE_ENV ?? 'development') === 'development';
const enableInDev = process.env.SENTRY_ENABLE_DEV === 'true';

if (dsn && (!isDev || enableInDev)) {
  Sentry.init({
    ...buildSentryOptions(),
    integrations: [nodeProfilingIntegration()],
  });
}
