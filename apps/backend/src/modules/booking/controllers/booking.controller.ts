import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from '../dto/create-booking.dto';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('booking')
@Controller({ path: 'booking', version: '1' })
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  createBooking(@Req() req: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }
}
