import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../database/postgres.client';
import { RedisCacheService } from '../common/cache/redis-cache.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly db: PostgresClient,
    private readonly cache: RedisCacheService,
  ) {}

  async checkDependencies() {
    const [database, redis] = await Promise.all([this.db.ping(), this.cache.ping()]);
    return {
      database: database ? 'up' : 'down',
      redis: redis ? 'up' : 'down',
    };
  }
}
