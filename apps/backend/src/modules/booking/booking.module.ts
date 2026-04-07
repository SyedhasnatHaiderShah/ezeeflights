import { forwardRef, Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { ProfileModule } from '../profile/profile.module';
import { UserModule } from '../user/user.module';
import { BookingController } from './controllers/booking.controller';
import { BookingRepository } from './repositories/booking.repository';
import { BookingService } from './services/booking.service';

@Module({
  imports: [UserModule, forwardRef(() => ProfileModule)],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, PostgresClient],
  exports: [BookingService],
})
export class BookingModule {}
