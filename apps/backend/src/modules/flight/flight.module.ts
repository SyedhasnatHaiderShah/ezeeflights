import { Module } from '@nestjs/common';
import { IntegrationsModule } from '../integrations/integrations.module';
import { FlightController } from './controllers/flight.controller';
import { FlightService } from './services/flight.service';
import { TravelportBookingService } from './services/travelport-booking.service';
import { FlightRepository } from './repositories/flight.repository';
import { PostgresClient } from '../../database/postgres.client';
import { SeatMapService } from './seat-map.service';
import { SeatMapRepository } from './repositories/seat-map.repository';
import { AncillariesService } from './ancillaries.service';
import { AncillariesRepository } from './repositories/ancillaries.repository';

@Module({
  imports: [IntegrationsModule],
  controllers: [FlightController],
  providers: [
    FlightService,
    TravelportBookingService,
    FlightRepository,
    SeatMapService,
    SeatMapRepository,
    AncillariesService,
    AncillariesRepository,
    PostgresClient,
  ],
  exports: [FlightService, TravelportBookingService],
})
export class FlightModule { }
