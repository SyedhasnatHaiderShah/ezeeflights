import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

type CacheEntry = { value: string; expiresAt: number };

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly memory = new Map<string, CacheEntry>();
  private redis: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, mode: string, ttlSeconds: number) => Promise<unknown>;
    del: (key: string) => Promise<unknown>;
    ping: () => Promise<string>;
    quit: () => Promise<void>;
  } | null = null;

  constructor() {
    this.bootstrapRedis();
  }

  private bootstrapRedis(): void {
    try {
      // optional runtime dependency in locked environments
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const req = Function('return require')() as (name: string) => unknown;
      const RedisCtor = req('ioredis') as new (url: string, options?: Record<string, unknown>) => {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string, mode: string, ttlSeconds: number) => Promise<unknown>;
        del: (key: string) => Promise<unknown>;
        ping: () => Promise<string>;
        quit: () => Promise<void>;
      };

      const url = process.env.REDIS_URL;
      if (!url) {
        this.logger.warn('REDIS_URL not configured; using in-memory cache fallback');
        return;
      }

      this.redis = new RedisCtor(url, { lazyConnect: false, maxRetriesPerRequest: 1 });
      this.logger.log('Redis cache client initialized');
    } catch {
      this.logger.warn('ioredis is unavailable; using in-memory cache fallback');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.redis) {
      return this.redis.get(key);
    }
    const entry = this.memory.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.redis) {
      await this.redis.set(key, value, 'EX', ttlSeconds);
      return;
    }
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
      return;
    }
    this.memory.delete(key);
  }

  async ping(): Promise<boolean> {
    if (this.redis) {
      try {
        return (await this.redis.ping()) === 'PONG';
      } catch {
        return false;
      }
    }
    return true;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}
