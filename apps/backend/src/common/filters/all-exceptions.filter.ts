import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  correlationId: string;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception);
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? 'no-correlation-id';

    if (statusCode >= 500) {
      this.logger.error(
        { err: exception, path: req.url, method: req.method, statusCode, correlationId },
        typeof message === 'string' ? message : message[0],
      );
      // Report to Sentry with full request context — 4xx client errors are intentionally excluded
      Sentry.withScope((scope) => {
        scope.setTag('correlationId', correlationId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scope.setTag('userId', (req as any).user?.userId ?? 'anonymous');
        scope.setExtra('path', req.url);
        scope.setExtra('method', req.method);
        scope.setExtra('query', req.query);
        scope.setExtra('params', req.params);
        Sentry.captureException(exception);
      });
    } else {
      this.logger.warn(
        { path: req.url, method: req.method, statusCode, message, correlationId },
        'Client error',
      );
    }

    const body: ErrorResponse = {
      statusCode,
      error: HttpStatus[statusCode] ?? 'Error',
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: req.url,
    };

    res.status(statusCode).json(body);
  }

  private extractMessage(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return 'Internal server error';
    }

    const response = exception.getResponse();
    if (typeof response === 'string') return response;

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const msg = (response as Record<string, unknown>).message;
      if (Array.isArray(msg)) return msg as string[];
      if (typeof msg === 'string') return msg;
    }

    return exception.message;
  }
}
