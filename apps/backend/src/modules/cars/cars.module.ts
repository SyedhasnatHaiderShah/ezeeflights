import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { CarsController } from './cars.controller';
import { CarRepository } from './cars.repository';
import { CarService } from './cars.service';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PublicModule } from '../public/public.module';
import { HybridEngineModule } from '../hybrid-engine/hybrid.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [IntegrationsModule, PublicModule, HybridEngineModule, NotificationModule],
  controllers: [CarsController],
  providers: [CarService, CarRepository, MysqlClient],
  exports: [CarService],
})
export class CarsModule {}
