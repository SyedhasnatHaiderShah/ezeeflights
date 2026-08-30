import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContextService } from '../context/context.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(private readonly ctx: ContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.headers['x-correlation-id'];
    const isValid =
      typeof incoming === 'string' && /^[a-zA-Z0-9\-_]{1,64}$/.test(incoming);
    const correlationId = isValid ? (incoming as string) : crypto.randomUUID();

    req.headers['x-correlation-id'] = correlationId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    this.ctx.set('correlationId', correlationId);

    next();
  }
}
