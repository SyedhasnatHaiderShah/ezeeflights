import { Module } from '@nestjs/common';
import { EventsModule } from '../../common/events/events.module';
import { PostgresClient } from '../../database/postgres.client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsRoutes } from './analytics.routes';
import { AnalyticsService } from './analytics.service';
import { EventTrackerService } from './eventTracker.service';

@Module({
  imports: [EventsModule],
  controllers: [AnalyticsRoutes],
  providers: [
    PostgresClient,
    RolesGuard,
    AnalyticsController,
    AnalyticsService,
    AnalyticsRepository,
    EventTrackerService,
  ],
  exports: [AnalyticsService, EventTrackerService],
})
export class AnalyticsModule {}
