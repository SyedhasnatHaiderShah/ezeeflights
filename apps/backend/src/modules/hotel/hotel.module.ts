import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { IntegrationsModule } from '../integrations/integrations.module';
import { HotelController } from './controllers/hotel.controller';
import { HotelRepository } from './repositories/hotel.repository';
import { HotelService } from './services/hotel.service';

@Module({
  imports: [IntegrationsModule],
  controllers: [HotelController],
  providers: [HotelService, HotelRepository, PostgresClient],
  exports: [HotelService, HotelRepository],
})
export class HotelModule {}
