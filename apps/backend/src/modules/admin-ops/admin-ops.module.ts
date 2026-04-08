import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { AdminModule } from '../admin/admin.module';
import { FinanceController } from './finance.controller';
import { AdminOpsRepository } from './admin-ops.repository';
import { FinanceService } from './finance.service';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';

@Module({
  imports: [AdminModule],
  controllers: [RevenueController, OperationsController, FinanceController, MonitoringController, InsightsController],
  providers: [AdminOpsRepository, RevenueService, OperationsService, FinanceService, MonitoringService, InsightsService, PostgresClient],
})
export class AdminOpsModule {}
