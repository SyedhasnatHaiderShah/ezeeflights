import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { PackageBookingService } from './booking.service';
import { ItineraryService } from './itinerary.service';
import { PackageController } from './package.controller';
import { PackageRepository } from './package.repository';
import { PackageService } from './package.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [PaymentModule, NotificationModule, AdminModule],
  controllers: [PackageController],
  providers: [PackageService, PackageRepository, ItineraryService, PackageBookingService, MysqlClient],
  exports: [PackageService, ItineraryService],
})
export class PackageModule {}
