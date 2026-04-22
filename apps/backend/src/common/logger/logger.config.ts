import type { Params } from 'nestjs-pino';
import type { LevelWithSilent } from 'pino';
import type { TransportMultiOptions, TransportSingleOptions } from 'pino';
import type { IncomingMessage } from 'http';

const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.newPassword',
  'req.body.token',
  'req.body.refreshToken',
  'req.body.cardNumber',
  'req.body.cvv',
  'req.body.cvc',
  'req.body.creditCard',
  '*.password',
  '*.token',
  '*.secret',
  '*.apiKey',
  '*.api_key',
  '*.authorization',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function customLevelFn(_req: IncomingMessage, res: any, _err?: Error): LevelWithSilent {
  if (res.statusCode >= 500) return 'error';
  if (res.statusCode >= 400) return 'warn';
  return 'info';
}

function buildTransport(isProduction: boolean): TransportSingleOptions | TransportMultiOptions | undefined {
  const prettyTransport: TransportSingleOptions = {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
  };

  if (!isProduction) return prettyTransport;

  // ── Log Shipping ──────────────────────────────────────────────────────────
  // To enable Better Stack: npm install @logtail/pino
  // Set LOG_SHIPPING_PROVIDER=better-stack and LOGTAIL_SOURCE_TOKEN=<token>
  //
  // To enable Datadog: npm install pino-datadog-transport
  // Set LOG_SHIPPING_PROVIDER=datadog, DATADOG_API_KEY=<key>, DATADOG_SITE=datadoghq.com
  //
  // Example multi-transport (stdout JSON + Better Stack):
  // return {
  //   targets: [
  //     { target: 'pino/file', options: { destination: 1 }, level: 'info' },
  //     { target: '@logtail/pino', options: { sourceToken: process.env.LOGTAIL_SOURCE_TOKEN }, level: 'info' },
  //   ],
  // };
  // ─────────────────────────────────────────────────────────────────────────

  return undefined; // raw JSON to stdout in production; wire a transport above when ready
}

export function getPinoConfig(nodeEnv: string): Params {
  const isProduction = nodeEnv === 'production';

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? 'info',
      redact: {
        paths: REDACTED_PATHS,
        censor: '[REDACTED]',
      },
      transport: buildTransport(isProduction),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customProps: (req: any) => ({
        correlationId: req.headers?.['x-correlation-id'] ?? req.correlationId ?? 'no-correlation-id',
        userId: (req as any).user?.userId ?? 'anonymous',
        service: 'ezeeflights-api',
      }),
      customLogLevel: customLevelFn,
      serializers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req: (req: any) => ({
          method: req.method,
          url: req.url,
          id: req.id,
          query: req.query,
          params: req.params,
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res: (res: any) => ({
          statusCode: res.statusCode,
        }),
      },
    },
  };
}
