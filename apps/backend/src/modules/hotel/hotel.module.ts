import { Module } from '@nestjs/common';
import { HotelController } from './controllers/hotel.controller';
import { HotelService } from './services/hotel.service';
import { HotelRepository } from './repositories/hotel.repository';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  controllers: [HotelController],
  providers: [HotelService, HotelRepository, PostgresClient],
})
export class HotelModule {}
