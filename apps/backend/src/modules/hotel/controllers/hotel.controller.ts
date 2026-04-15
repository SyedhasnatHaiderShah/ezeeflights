import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { SearchRoomsDto } from '../dto/search-rooms.dto';
import { HotelService } from '../services/hotel.service';

@ApiTags('Hotels')
@Controller({ path: ['hotels', 'hotel'], version: '1' })
export class HotelController {
  constructor(private readonly service: HotelService) {}

  @ApiOperation({ summary: 'Hotel service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiOperation({ summary: 'Search hotels by city, date range and optional filters' })
  @ApiResponse({ status: 200, description: 'List of matching hotels' })
  @Get('search')
  search(@Query() query: SearchHotelsDto) {
    return this.service.search(query);
  }

  @ApiOperation({ summary: 'Get full hotel details' })
  @ApiParam({ name: 'id', description: 'Hotel UUID' })
  @ApiResponse({ status: 200, description: 'Hotel details' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Get(':id')
  details(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @ApiOperation({ summary: 'Get room inventory for a hotel' })
  @ApiParam({ name: 'id', description: 'Hotel UUID' })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Get(':id/rooms')
  rooms(@Param('id') id: string, @Query() query: SearchRoomsDto) {
    return this.service.getRooms(id, query);
  }
}
