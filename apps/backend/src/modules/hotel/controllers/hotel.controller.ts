import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HotelService } from '../services/hotel.service';
import { SearchHotelsDto } from '../dto/search-hotels.dto';

@ApiTags('hotel')
@Controller({ path: 'hotel', version: '1' })
export class HotelController {
  constructor(private readonly service: HotelService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @Get('search')
  search(@Query() query: SearchHotelsDto) {
    return this.service.search(query);
  }
}
