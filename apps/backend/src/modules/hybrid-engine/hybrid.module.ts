import { Module } from '@nestjs/common';
import { AmadeusProvider } from '../../common/providers';
import { PostgresClient } from '../../database/postgres.client';
import { HybridCacheService } from './cache.service';
import { FlightProviderService } from './flight.provider';
import { HotelProviderService } from './hotel.provider';
import { HybridController } from './hybrid.controller';
import { HybridRoutesController } from './hybrid.routes';
import { HybridService } from './hybrid.service';
import { PricingEngine } from './pricing.engine';

@Module({
  controllers: [HybridController, HybridRoutesController],
  providers: [
    HybridService,
    PricingEngine,
    FlightProviderService,
    HotelProviderService,
    AmadeusProvider,
    HybridCacheService,
    PostgresClient,
  ],
  exports: [HybridService],
})
export class HybridEngineModule {}
