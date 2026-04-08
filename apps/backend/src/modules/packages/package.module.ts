import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { PackageBookingService } from './booking.service';
import { ItineraryService } from './itinerary.service';
import { PackageController } from './package.controller';
import { PackageRepository } from './package.repository';
import { PackageService } from './package.service';

@Module({
  imports: [PaymentModule, NotificationModule],
  controllers: [PackageController],
  providers: [PackageService, PackageRepository, ItineraryService, PackageBookingService, PostgresClient],
})
export class PackageModule {}
