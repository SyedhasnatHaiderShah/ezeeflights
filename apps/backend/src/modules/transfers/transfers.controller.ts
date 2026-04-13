import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTransferBookingDto, SearchTransferDto } from './transfers.dto';
import { TransfersService } from './transfers.service';

interface JwtRequest {
  user: { userId: string };
}

@ApiTags('transfers')
@Controller({ path: 'transfers', version: '1' })
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @ApiOperation({ summary: 'Search airport transfers by airport IATA and destination city' })
  @Get('search')
  search(@Query() query: SearchTransferDto) {
    return this.service.searchTransfers(query);
  }

  @ApiOperation({ summary: 'List available transfer routes' })
  @Get('routes')
  routes(@Query('originIata') originIata?: string, @Query('destinationCity') destinationCity?: string) {
    return this.service.listRoutes(originIata, destinationCity);
  }

  @ApiOperation({ summary: 'Get transfer vehicle detail' })
  @Get(':vehicleId')
  detail(@Param('vehicleId') vehicleId: string) {
    return this.service.getVehicle(vehicleId);
  }

  @ApiOperation({ summary: 'Create transfer booking' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  createBooking(@Req() req: JwtRequest, @Body() dto: CreateTransferBookingDto) {
    return this.service.createBooking(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get my transfer bookings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('bookings/me')
  myBookings(@Req() req: JwtRequest) {
    return this.service.listMyBookings(req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel transfer booking' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('bookings/:id')
  cancel(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.service.cancelBooking(id, req.user.userId);
  }
}
