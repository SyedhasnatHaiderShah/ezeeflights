import { Controller, Get, Param, Query, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { SearchRoomsDto } from '../dto/search-rooms.dto';
import { SelectHotelDto } from '../dto/select-hotel.dto';
import { BookHotelDto } from '../dto/book-hotel.dto';
import { HotelService } from '../services/hotel.service';

@ApiTags('Hotels')
@Controller({ path: ['hotels', 'hotel', 'v1/hotels', 'v1/hotel'], version: '1' })
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
    console.log('HotelController: Received search request:', query);
    return this.service.search(query);
  }

  @ApiOperation({
    summary: 'Proxy search for Hotels',
    description: 'Accepts hotel search request and returns results.',
  })
  @Post('travelport-proxy/search')
  async travelportProxySearch(@Headers('x-api-key') apiKey: string, @Body() body: SearchHotelsDto) {
    const expectedKey = process.env.EZEEFLIGHTS_API_KEY;
    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Firewall Blocked: Invalid or missing X-API-KEY header.');
    }
    
    return this.service.searchTravelportProxy(body);
  }

  @ApiOperation({ summary: 'Get full hotel details' })
  @ApiParam({ name: 'id', description: 'Hotel UUID' })
  @ApiResponse({ status: 200, description: 'Hotel details' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Get(':id')
  details(
    @Param('id') id: string,
    @Query('checkInDate') checkInDate?: string,
    @Query('checkOutDate') checkOutDate?: string,
    @Query('city') city?: string,
  ) {
    return this.service.getById(id, checkInDate, checkOutDate, city);
  }

  @ApiOperation({ summary: 'Get room inventory for a hotel' })
  @ApiParam({ name: 'id', description: 'Hotel UUID' })
  @ApiResponse({ status: 200, description: 'List of rooms' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  @Get(':id/rooms')
  rooms(@Param('id') id: string, @Query() query: SearchRoomsDto) {
    return this.service.getRooms(id, query);
  }

  @ApiOperation({ summary: 'Select a hotel room before proceeding to booking' })
  @ApiResponse({ status: 200, description: 'Select response with session and verified price' })
  @Post('select')
  selectHotel(@Body() dto: SelectHotelDto) {
    return this.service.selectHotel(dto);
  }

  @ApiOperation({ summary: 'Confirm and book a hotel room' })
  @ApiResponse({ status: 200, description: 'Booking confirmation details' })
  @Post('book')
  bookHotel(@Body() dto: BookHotelDto) {
    return this.service.bookHotel(dto);
  }

  @ApiOperation({ summary: 'Get hotel media links/images from Travelport' })
  @ApiResponse({ status: 200, description: 'Media URLs and metadata' })
  @Get(':id/media-links')
  async getHotelMediaLinks(
    @Param('id') id: string,
    @Query('sizeCode') sizeCode?: string,
    @Query('chainCode') chainCode?: string,
  ) {
    const [parsedChain, parsedCode] = id.includes('-') ? id.split('-') : ['', id];
    const finalChain = chainCode || parsedChain;
    const finalCode = parsedCode || id;
    return this.service.getHotelMediaLinks(finalCode, finalChain, sizeCode);
  }
}

