import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { BookingProviderService } from '../integrations/booking-provider.service';
import { HotelController } from './controllers/hotel.controller';
import { HotelRepository } from './repositories/hotel.repository';
import { HotelService } from './services/hotel.service';

@Module({
  controllers: [HotelController],
  providers: [HotelService, HotelRepository, BookingProviderService, PostgresClient],
  exports: [HotelService, HotelRepository],
})
export class HotelModule {}
