import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransferBookingDto, SearchTransferDto } from './transfers.dto';
import { TransfersService } from './transfers.service';

interface JwtRequest {
  user: { userId: string };
}

@ApiTags('Transfers')
@Controller({ path: 'transfers', version: '1' })
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @ApiOperation({ summary: 'Search airport transfers by airport IATA and destination city' })
  @ApiResponse({ status: 200, description: 'List of available transfer vehicles' })
  @Get('search')
  search(@Query() query: SearchTransferDto) {
    return this.service.searchTransfers(query);
  }

  @ApiOperation({ summary: 'List available transfer routes' })
  @ApiQuery({ name: 'originIata', required: false, description: 'Origin airport IATA code' })
  @ApiQuery({ name: 'destinationCity', required: false, description: 'Destination city name' })
  @ApiResponse({ status: 200, description: 'Array of transfer routes' })
  @Get('routes')
  routes(@Query('originIata') originIata?: string, @Query('destinationCity') destinationCity?: string) {
    return this.service.listRoutes(originIata, destinationCity);
  }

  @ApiOperation({ summary: 'Get transfer vehicle detail' })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle UUID' })
  @ApiResponse({ status: 200, description: 'Vehicle details' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @Get(':vehicleId')
  detail(@Param('vehicleId') vehicleId: string) {
    return this.service.getVehicle(vehicleId);
  }

  @ApiOperation({ summary: 'Create transfer booking' })
  @ApiResponse({ status: 201, description: 'Transfer booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(@Req() req: JwtRequest, @Body() dto: CreateTransferBookingDto) {
    return this.service.createBooking(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get my transfer bookings' })
  @ApiResponse({ status: 200, description: 'Array of transfer bookings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/me')
  myBookings(@Req() req: JwtRequest) {
    return this.service.listMyBookings(req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel transfer booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('bookings/:id')
  cancel(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.service.cancelBooking(id, req.user.userId);
  }
}
