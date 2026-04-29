import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { AdminModule } from '../admin/admin.module';
import { PromotionsAdminController, PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({
  imports: [AdminModule],
  controllers: [PromotionsController, PromotionsAdminController],
  providers: [PromotionsService, PostgresClient],
  exports: [PromotionsService],
})
export class PromotionsModule {}
