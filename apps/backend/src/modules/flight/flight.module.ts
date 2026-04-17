import { Module } from '@nestjs/common';
import { FlightController } from './controllers/flight.controller';
import { FlightService } from './services/flight.service';
import { FlightRepository } from './repositories/flight.repository';

@Module({
  controllers: [FlightController],
  providers: [FlightService, FlightRepository],
  exports: [FlightService],
})
export class FlightModule {}
