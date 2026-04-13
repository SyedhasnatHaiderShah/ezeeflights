import { Module } from '@nestjs/common';
import { AmadeusProvider } from '../../common/providers';
import { FlightController } from './controllers/flight.controller';
import { FlightService } from './services/flight.service';
import { FlightRepository } from './repositories/flight.repository';
import { PostgresClient } from '../../database/postgres.client';
import { SeatMapService } from './seat-map.service';
import { SeatMapRepository } from './repositories/seat-map.repository';
import { AncillariesService } from './ancillaries.service';
import { AncillariesRepository } from './repositories/ancillaries.repository';

@Module({
  controllers: [FlightController],
  providers: [FlightService, FlightRepository, SeatMapService, SeatMapRepository, AncillariesService, AncillariesRepository, PostgresClient, AmadeusProvider],
  exports: [FlightService],
})
export class FlightModule { }
