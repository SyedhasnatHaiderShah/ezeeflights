import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { BookingModule } from '../booking/booking.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { AmadeusAdapter } from './adapters/amadeus.adapter';
import { InternalMockAdapter } from './adapters/internal-mock.adapter';
import { SabreAdapter } from './adapters/sabre.adapter';
import { TravelportAdapter } from './adapters/travelport.adapter';
import { PnrController } from './controllers/pnr.controller';
import { GdsProviderService } from './providers/gds-provider.service';
import { PnrRepository } from './repositories/pnr.repository';
import { TicketRepository } from './repositories/ticket.repository';
import { PnrService } from './services/pnr.service';
import { TicketService } from './services/ticket.service';
import { TicketingEventListener } from './services/ticketing-listener.service';

import { FlightModule } from '../flight/flight.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [BookingModule, NotificationModule, UserModule, FlightModule, IntegrationsModule],
  controllers: [PnrController],
  providers: [
    MysqlClient,
    PnrRepository,
    TicketRepository,
    PnrService,
    TicketService,
    TicketingEventListener,
    AmadeusAdapter,
    SabreAdapter,
    TravelportAdapter,
    InternalMockAdapter,
    {
      provide: GdsProviderService,
      useFactory: (amadeus: AmadeusAdapter, sabre: SabreAdapter, travelport: TravelportAdapter, internal: InternalMockAdapter) =>
        new GdsProviderService([amadeus, sabre, travelport, internal]),
      inject: [AmadeusAdapter, SabreAdapter, TravelportAdapter, InternalMockAdapter],
    },
  ],
})
export class TicketingModule {}
