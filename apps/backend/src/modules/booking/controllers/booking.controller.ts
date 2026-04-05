import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';

@ApiTags('booking')
@Controller({ path: 'booking', version: '1' })
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get('health')
  health() {
    return this.service.health();
  }
}
