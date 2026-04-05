import { Module } from '@nestjs/common';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { BookingRepository } from './repositories/booking.repository';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, PostgresClient],
})
export class BookingModule {}
