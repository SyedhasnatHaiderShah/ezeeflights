import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { NotificationModule } from '../notification/notification.module';
import { AiRecommendationService } from './ai.recommendation.service';
import { AttractionService } from './attraction.service';
import { DestinationController } from './destination.controller';
import { DestinationRepository } from './destination.repository';
import { DestinationService } from './destination.service';
import { TourProviderService } from './integrations/tour-provider.service';
import { MapService } from './map.service';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [NotificationModule],
  controllers: [DestinationController],
  providers: [
    DestinationService,
    DestinationRepository,
    AttractionService,
    WishlistService,
    AiRecommendationService,
    MapService,
    TourProviderService,
    PostgresClient,
  ],
})
export class DestinationModule {}
