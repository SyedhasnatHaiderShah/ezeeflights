import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
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
  @Get('me')
  myTrips(@Req() req: AuthenticatedRequest, @Query('type') type?: string, @Query('status') status?: string) {
    return this.service.getMyTrips(req.user.userId, type, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/list')
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  myTripDetail(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getTripById(req.user.userId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/:id/document')
  async tripDocument(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('docType') docType: 'ticket' | 'voucher' | 'insurance' = 'ticket',
    @Res() res: Response,
  ): Promise<void> {
    const document = await this.service.getTripDocument(req.user.userId, id, docType);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.send(document.content);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/:id/cancel')
  cancelMyTrip(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string } = {}) {
    return this.service.cancelTrip(req.user.userId, id, body.reason);
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

}
