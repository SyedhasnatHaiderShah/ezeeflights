import { Module } from '@nestjs/common';
import { FlightController } from './controllers/flight.controller';
import { FlightService } from './services/flight.service';
import { FlightRepository } from './repositories/flight.repository';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  controllers: [FlightController],
  providers: [FlightService, FlightRepository, PostgresClient],
  exports: [FlightService],
})
export class FlightModule {}
