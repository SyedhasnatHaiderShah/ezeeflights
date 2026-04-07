import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateHotelBookingDto } from '../dto/create-hotel-booking.dto';
import { HotelBookingService } from '../services/hotel-booking.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('hotel-bookings')
@Controller({ path: 'hotel-bookings', version: '1' })
export class HotelBookingController {
  constructor(private readonly service: HotelBookingService) {}

  @ApiOperation({ summary: 'Create hotel booking' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateHotelBookingDto) {
    return this.service.create(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  listByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.getUserBookings(req.user.userId === userId ? userId : req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.cancel(id, req.user.userId);
  }
}
