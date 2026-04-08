import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

type CacheRecord = { value: unknown; expiresAt: number };

@Injectable()
export class HybridCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(HybridCacheService.name);
  private readonly memory = new Map<string, CacheRecord>();
  private redisClient: any | null = null;

  constructor() {
    this.initializeRedis();
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redisClient) {
      const raw = await this.redisClient.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }

    const hit = this.memory.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.memory.delete(key);
      return null;
    }
    return hit.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    }

    this.memory.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.del(key);
      return;
    }
    this.memory.delete(key);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private initializeRedis(): void {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      this.logger.warn('REDIS_URL is not configured. Falling back to in-memory cache.');
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RedisCtor = require('ioredis');
      this.redisClient = new RedisCtor(redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
      });
      this.redisClient.on('error', (error: Error) => {
        this.logger.error(`Redis unavailable, fallback in-memory mode: ${error.message}`);
        this.redisClient = null;
      });
    } catch (error) {
      this.logger.error(`Redis module missing; using in-memory cache. ${(error as Error).message}`);
      this.redisClient = null;
    }
  }
}
