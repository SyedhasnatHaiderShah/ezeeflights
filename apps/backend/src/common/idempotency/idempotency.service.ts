import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class IdempotencyService {
  private static readonly TTL_SECONDS = 24 * 60 * 60;

  constructor(private readonly cache: RedisCacheService) {}

  private cacheKey(scope: string, key: string): string {
    return `idempotency:${scope}:${key}`;
  }

  async getCached<T>(scope: string, key: string): Promise<T | null> {
    const raw = await this.cache.get(this.cacheKey(scope, key));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  }

  async setCached<T>(scope: string, key: string, value: T): Promise<void> {
    await this.cache.set(this.cacheKey(scope, key), JSON.stringify(value), IdempotencyService.TTL_SECONDS);
  }
}
