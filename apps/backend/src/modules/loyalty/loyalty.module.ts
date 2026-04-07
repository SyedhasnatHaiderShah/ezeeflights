import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyEventsListener } from './listeners/loyalty-events.listener';
import { LoyaltyRepository } from './repositories/loyalty.repository';
import { LoyaltyService } from './services/loyalty.service';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService, LoyaltyRepository, LoyaltyEventsListener, PostgresClient],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
