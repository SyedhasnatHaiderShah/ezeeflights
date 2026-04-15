import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateHotelBookingDto } from '../dto/create-hotel-booking.dto';
import { HotelBookingService } from '../services/hotel-booking.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Hotel Bookings')
@Controller({ path: 'hotel-bookings', version: '1' })
export class HotelBookingController {
  constructor(private readonly service: HotelBookingService) {}

  @ApiOperation({ summary: 'Create hotel booking' })
  @ApiResponse({ status: 201, description: 'Hotel booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateHotelBookingDto) {
    return this.service.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get hotel booking by ID' })
  @ApiParam({ name: 'id', description: 'Hotel booking UUID' })
  @ApiResponse({ status: 200, description: 'Hotel booking data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getById(id, req.user.userId);
  }

  @ApiOperation({ summary: 'List hotel bookings for a user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Array of hotel bookings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  listByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.getUserBookings(req.user.userId === userId ? userId : req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel hotel booking' })
  @ApiParam({ name: 'id', description: 'Hotel booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.cancel(id, req.user.userId);
  }
}
