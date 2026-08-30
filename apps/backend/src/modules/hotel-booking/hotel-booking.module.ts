import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';
import { ProfileModule } from '../profile/profile.module';
import { UserModule } from '../user/user.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PublicModule } from '../public/public.module';
import { HotelBookingController } from './controllers/hotel-booking.controller';
import { HotelBookingRepository } from './repositories/hotel-booking.repository';
import { HotelBookingService } from './services/hotel-booking.service';
import { HotelBookingSchemaBootstrap } from './hotel-booking-schema.bootstrap';

@Module({
  imports: [UserModule, NotificationModule, PaymentModule, ProfileModule, IntegrationsModule, PublicModule],
  controllers: [HotelBookingController],
  providers: [
    HotelBookingService,
    HotelBookingRepository,
    HotelBookingSchemaBootstrap,
    MysqlClient,
  ],
})
export class HotelBookingModule { }
