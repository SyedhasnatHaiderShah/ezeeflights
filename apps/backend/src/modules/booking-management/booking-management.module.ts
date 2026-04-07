import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { BookingMgmtController } from './bookingMgmt.controller';
import { BookingMgmtRepository } from './bookingMgmt.repository';
import { BookingMgmtService } from './bookingMgmt.service';
import { LOYALTY_PORT, TICKETING_PORT } from './integrations/dependency-ports';

@Module({
  imports: [PaymentModule, NotificationModule],
  controllers: [BookingMgmtController],
  providers: [
    BookingMgmtService,
    BookingMgmtRepository,
    PostgresClient,
    {
      provide: TICKETING_PORT,
      useValue: {
        cancelByBookingId: async () => undefined,
      },
    },
    {
      provide: LOYALTY_PORT,
      useValue: {
        adjustOnCancellation: async () => undefined,
      },
    },
  ],
  exports: [BookingMgmtService],
})
export class BookingManagementModule {}
