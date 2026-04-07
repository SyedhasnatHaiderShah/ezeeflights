import { forwardRef, Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { ProfileModule } from '../profile/profile.module';
import { BookingManagementModule } from '../booking-management/booking-management.module';
import { UserModule } from '../user/user.module';
import { BookingController } from './controllers/booking.controller';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './services/booking.service';

@Module({
  imports: [UserModule, forwardRef(() => ProfileModule), BookingManagementModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, PostgresClient],
  exports: [BookingService],
})
export class BookingModule {}
