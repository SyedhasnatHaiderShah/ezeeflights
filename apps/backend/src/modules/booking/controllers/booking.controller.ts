import { BadRequestException, Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from '../dto/create-booking.dto';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('booking')
@Controller({ path: 'bookings', version: '1' })
export class BookingController {
  constructor(private readonly service: BookingService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiBearerAuth()
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @UseGuards(JwtAuthGuard)
  @Post()
  createBooking(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateBookingDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return this.service.create(req.user.userId, dto, idempotencyKey);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }
}
