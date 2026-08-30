import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { AdminModule } from '../admin/admin.module';
import { PromotionsAdminController, PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({
  imports: [AdminModule],
  controllers: [PromotionsController, PromotionsAdminController],
  providers: [PromotionsService, MysqlClient],
  exports: [PromotionsService],
})
export class PromotionsModule {}
