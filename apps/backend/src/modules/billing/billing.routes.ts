import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceService } from './invoice.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('billing-legacy')
@Controller('api/invoices')
export class LegacyBillingController {
  constructor(private readonly service: InvoiceService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  generate(@Req() req: AuthenticatedRequest, @Body() body: { bookingId: string }) {
    return this.service.generateFromBooking(body.bookingId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  byUser(@Req() req: AuthenticatedRequest, @Param('userId') userId: string) {
    return this.service.listByUser(userId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  byId(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getInvoiceById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  pay(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { amount: number; method: 'CARD' | 'BNPL'; provider: 'STRIPE' | 'PAYTABS' | 'TABBY' | 'TAMARA'; status: 'PENDING' | 'SUCCESS' | 'FAILED'; transactionId: string }) {
    return this.service.recordPayment(id, req.user.userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  refund(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: { amount: number; reason?: string }) {
    return this.service.createRefund(id, req.user.userId, body.amount, body.reason ?? 'Customer refund request');
  }
}
