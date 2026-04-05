import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HotelService } from '../services/hotel.service';

@ApiTags('hotel')
@Controller({ path: 'hotel', version: '1' })
export class HotelController {
  constructor(private readonly service: HotelService) {}

  @Get('health')
  health() {
    return this.service.health();
  }
}
