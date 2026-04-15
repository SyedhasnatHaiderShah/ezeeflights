import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { modifyBookingSchema, refundBookingSchema } from './dto/bookingMgmt.dto';
import { BookingMgmtService } from './bookingMgmt.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('Booking Management')
@Controller({ path: 'bookings', version: '1' })
export class BookingMgmtController {
  constructor(private readonly service: BookingMgmtService) {}

  @ApiOperation({ summary: 'Modify booking date or passenger details' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking modified' })
  @ApiResponse({ status: 400, description: 'Invalid modification payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/modify')
  modify(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const dto = this.parseBody(modifyBookingSchema, body);
    return this.service.modifyBooking(id, req.user.userId, dto, this.isAdmin(req));
  }

  @ApiOperation({ summary: 'Process full/partial refund for booking' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Refund processed' })
  @ApiResponse({ status: 400, description: 'Invalid refund payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  refund(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const dto = this.parseBody(refundBookingSchema, body);
    return this.service.processRefund(req.user.userId, id, dto);
  }

  @ApiOperation({ summary: 'Get booking change, refund and action history' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking history events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/history')
  history(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getHistory(id, req.user.userId, this.isAdmin(req));
  }

  private isAdmin(req: AuthenticatedRequest) {
    return (req.user.roles ?? []).includes('admin');
  }

  private parseBody<T>(schema: { safeParse: (value: unknown) => { success: boolean; data?: T; error?: { errors?: { message: string }[] } } }, body: unknown): T {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error?.errors?.[0]?.message ?? 'Invalid request payload';
      throw new BadRequestException(firstError);
    }
    return parsed.data as T;
  }
}

