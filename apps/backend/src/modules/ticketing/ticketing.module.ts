import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
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

@Module({
  imports: [BookingModule, NotificationModule, UserModule],
  controllers: [PnrController],
  providers: [
    PostgresClient,
    PnrRepository,
    TicketRepository,
    PnrService,
    TicketService,
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
