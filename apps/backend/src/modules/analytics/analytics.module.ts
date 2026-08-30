import { Module } from '@nestjs/common';
import { EventsModule } from '../../common/events/events.module';
import { MysqlClient } from '../../database/mysql.client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsRoutes } from './analytics.routes';
import { AnalyticsService } from './analytics.service';
import { EventTrackerService } from './eventTracker.service';

import { PublicStatsController } from './public-stats.controller';

@Module({
  imports: [EventsModule],
  controllers: [AnalyticsRoutes, PublicStatsController],
  providers: [
    MysqlClient,
    RolesGuard,
    AnalyticsController,
    AnalyticsService,
    AnalyticsRepository,
    EventTrackerService,
  ],
  exports: [AnalyticsService, EventTrackerService],
})
export class AnalyticsModule {}
