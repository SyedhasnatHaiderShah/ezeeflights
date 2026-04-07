import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { ProfileModule } from '../profile/profile.module';
import { UserModule } from '../user/user.module';
import { HotelBookingController } from './controllers/hotel-booking.controller';
import { HotelBookingRepository } from './repositories/hotel-booking.repository';
import { HotelBookingService } from './services/hotel-booking.service';

@Module({
  imports: [UserModule, NotificationModule, LoyaltyModule, PaymentModule, ProfileModule],
  controllers: [HotelBookingController],
  providers: [HotelBookingService, HotelBookingRepository, PostgresClient],
})
export class HotelBookingModule {}
