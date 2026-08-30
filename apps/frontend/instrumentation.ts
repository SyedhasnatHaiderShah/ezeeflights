export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    const { buildServerSentryOptions } = await import('./lib/sentry/sentry-server-config');
    const opts = buildServerSentryOptions();
    if (opts) init(opts);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs');
    const dsn = process.env.SENTRY_DSN;
    const isDev = (process.env.NODE_ENV ?? 'development') === 'development';
    const enableInDev = process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV === 'true';
    if (dsn && (!isDev || enableInDev)) {
      init({
        dsn,
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
        environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
        release: process.env.SENTRY_RELEASE,
      });
    }
  }
}
