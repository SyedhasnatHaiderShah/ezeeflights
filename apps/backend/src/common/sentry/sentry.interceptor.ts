import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as Sentry from '@sentry/nestjs';
import { Request } from 'express';

@Injectable()
export class SentryContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const correlationId =
      (req.headers['x-correlation-id'] as string) ?? 'no-correlation-id';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId: string = (req as any).user?.userId ?? 'anonymous';

    const scope = Sentry.getCurrentScope();
    scope.setTag('correlationId', correlationId);
    scope.setTag('userId', userId);
    scope.setTag('environment', process.env.NODE_ENV ?? 'development');
    scope.setTag('release', process.env.SENTRY_RELEASE ?? 'unknown');
    scope.setUser({ id: userId });

    return next.handle();
  }
}
