import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingService } from '../services/booking.service';
import { BookingMgmtService } from '../../booking-management/bookingMgmt.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('Bookings')
@Controller({ path: 'bookings', version: '1' })
export class BookingController {
  constructor(
    private readonly service: BookingService,
    private readonly bookingMgmtService: BookingMgmtService,
  ) {}

  @ApiOperation({ summary: 'Booking service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiOperation({ summary: 'Create booking' })
  @ApiResponse({ status: 201, description: 'Booking created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  createBooking(@Req() req: AuthenticatedRequest, @Body() dto: CreateBookingDto) {
    return this.service.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'List my trips with optional filters' })
  @ApiQuery({ name: 'type', required: false, description: 'Booking type (flight, hotel, etc.)' })
  @ApiQuery({ name: 'status', required: false, description: 'Booking status filter' })
  @ApiResponse({ status: 200, description: 'Array of trips' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  myTrips(@Req() req: AuthenticatedRequest, @Query('type') type?: string, @Query('status') status?: string) {
    return this.service.getMyTrips(req.user.userId, type, status);
  }

  @ApiOperation({ summary: 'Get trip detail by ID' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Trip detail' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  myTripDetail(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getTripById(req.user.userId, id);
  }

  @ApiOperation({ summary: 'Download trip document (ticket/voucher/insurance)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiQuery({ name: 'docType', required: false, enum: ['ticket', 'voucher', 'insurance'], description: 'Document type' })
  @ApiResponse({ status: 200, description: 'PDF document stream' })
  @ApiResponse({ status: 404, description: 'Booking or document not found' })
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

  @ApiOperation({ summary: 'Cancel my trip' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Trip cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me/:id/cancel')
  cancelMyTrip(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string } = {}) {
    return this.service.cancelTrip(req.user.userId, id, body.reason);
  }

  @ApiOperation({ summary: 'List bookings for a specific user' })
  @ApiParam({ name: 'userId', description: 'Target user UUID' })
  @ApiResponse({ status: 200, description: 'Array of bookings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  listByUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    const targetUserId = req.user.userId === userId ? userId : req.user.userId;
    return this.service.getUserBookings(targetUserId);
  }

  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking data' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getById(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { reason?: string; refundAmount?: number } = {}) {
    return this.bookingMgmtService.cancelBooking(id, req.user.userId, body, (req.user.roles ?? []).includes('admin'));
  }

  @ApiOperation({ summary: 'List my bookings' })
  @ApiResponse({ status: 200, description: 'Array of bookings' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/list')
  myBookings(@Req() req: AuthenticatedRequest) {
    return this.service.getUserBookings(req.user.userId);
  }
}
