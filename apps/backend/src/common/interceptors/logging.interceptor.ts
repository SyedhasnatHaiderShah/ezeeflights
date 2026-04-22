import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const handler = `${controllerName}.${handlerName}`;
    const start = Date.now();

    this.logger.debug(
      { handler, method: req.method, url: req.url },
      'Request started',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.debug(
            { handler, durationMs: Date.now() - start },
            'Request completed',
          );
        },
        error: () => {
          this.logger.debug(
            { handler, durationMs: Date.now() - start },
            'Request failed',
          );
        },
      }),
    );
  }
}
