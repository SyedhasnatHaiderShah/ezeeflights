import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { PinoLogger } from 'nestjs-pino';
import { ContextService } from '../context/context.service';

@Injectable()
export class HttpClientService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly ctx: ContextService,
  ) {}

  createWithCorrelation(config: AxiosRequestConfig): AxiosInstance {
    const instance = axios.create(config);
    // Use a closure-scoped map per-instance so concurrent requests don't collide
    const timings = new Map<string, number>();

    instance.interceptors.request.use((req) => {
      const correlationId = this.ctx.get('correlationId') ?? '';
      if (!req.headers) req.headers = {} as typeof req.headers;
      req.headers['x-correlation-id'] = correlationId;

      const key = `${req.method ?? 'GET'}:${req.url ?? ''}:${Date.now()}`;
      // Store timing on the request config so the response interceptor can read it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).__timingKey = key;
      timings.set(key, Date.now());

      this.logger.debug(
        { url: req.url, method: req.method, correlationId },
        'HTTP outbound →',
      );
      return req;
    });

    instance.interceptors.response.use(
      (res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = (res.config as any).__timingKey as string | undefined;
        const durationMs = key ? Date.now() - (timings.get(key) ?? Date.now()) : 0;
        if (key) timings.delete(key);

        this.logger.debug(
          { url: res.config.url, method: res.config.method, status: res.status, durationMs },
          'HTTP outbound ←',
        );
        return res;
      },
      (err: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cfg = (err as any)?.config;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = cfg?.__timingKey as string | undefined;
        const durationMs = key ? Date.now() - (timings.get(key) ?? Date.now()) : 0;
        if (key) timings.delete(key);

        this.logger.warn(
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            url: cfg?.url,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            method: cfg?.method,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: (err as any)?.response?.status,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            message: (err as any)?.message,
            durationMs,
          },
          'HTTP outbound error',
        );
        return Promise.reject(err);
      },
    );

    return instance;
  }
}
