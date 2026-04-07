import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { SearchRoomsDto } from '../dto/search-rooms.dto';
import { HotelService } from '../services/hotel.service';

@ApiTags('hotels')
@Controller({ path: ['hotels', 'hotel'], version: '1' })
export class HotelController {
  constructor(private readonly service: HotelService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiOperation({ summary: 'Search hotels by city, date range and optional filters' })
  @Get('search')
  search(@Query() query: SearchHotelsDto) {
    return this.service.search(query);
  }

  @ApiOperation({ summary: 'Get full hotel details' })
  @Get(':id')
  details(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @ApiOperation({ summary: 'Get room inventory for a hotel' })
  @Get(':id/rooms')
  rooms(@Param('id') id: string, @Query() query: SearchRoomsDto) {
    return this.service.getRooms(id, query);
  }
}
