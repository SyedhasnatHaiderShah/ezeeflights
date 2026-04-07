import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingService } from '../services/booking.service';
import { BookingMgmtService } from '../../booking-management/bookingMgmt.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('booking')
@Controller({ path: 'bookings', version: '1' })
export class BookingController {
  constructor(
    private readonly service: BookingService,
    private readonly bookingMgmtService: BookingMgmtService,
  ) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiOperation({ summary: 'Create booking' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  createBooking(@Req() req: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  listByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    const targetUserId = req.user.userId === userId ? userId : req.user.userId;
    return this.service.getUserBookings(targetUserId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string; refundAmount?: number } = {}) {
    return this.bookingMgmtService.cancelBooking(id, req.user.userId, body, (req.user.roles ?? []).includes('admin'));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/list')
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }
}
