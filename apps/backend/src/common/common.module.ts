import { Global, Module } from '@nestjs/common';
import { RedisCacheService } from './cache/redis-cache.service';
import { IdempotencyService } from './idempotency/idempotency.service';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { PostgresClient } from '../database/postgres.client';

@Global()
@Module({
  providers: [PostgresClient, RedisCacheService, IdempotencyService, CircuitBreakerService],
  exports: [PostgresClient, RedisCacheService, IdempotencyService, CircuitBreakerService],
})
export class CommonModule {}
