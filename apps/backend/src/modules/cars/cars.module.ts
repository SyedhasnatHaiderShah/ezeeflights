import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { CarsController } from './cars.controller';
import { CarRepository } from './cars.repository';
import { CarService } from './cars.service';

@Module({
  controllers: [CarsController],
  providers: [CarService, CarRepository, PostgresClient],
  exports: [CarService],
})
export class CarsModule {}
