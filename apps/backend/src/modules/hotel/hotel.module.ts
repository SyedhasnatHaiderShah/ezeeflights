import { Module } from '@nestjs/common';
import { HotelController } from './controllers/hotel.controller';
import { HotelService } from './services/hotel.service';
import { HotelRepository } from './repositories/hotel.repository';

@Module({
  controllers: [HotelController],
  providers: [HotelService, HotelRepository],
})
export class HotelModule {}
