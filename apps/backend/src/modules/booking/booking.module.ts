import { Module } from '@nestjs/common';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { BookingRepository } from './repositories/booking.repository';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
})
export class BookingModule {}
