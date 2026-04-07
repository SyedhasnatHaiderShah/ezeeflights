import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { PaymentService } from '../services/payment.service';
import { RefundPaymentDto } from '../dto/refund-payment.dto';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  initiate(@Req() req: AuthenticatedRequest, @Body() dto: InitiatePaymentDto) {
    return this.service.initiatePayment(req.user.userId, dto);
  }

  @Post('webhook/stripe')
  stripeWebhook(@Body() payload: Record<string, unknown>, @Headers('stripe-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('STRIPE', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @Post('webhook/paytabs')
  paytabsWebhook(@Body() payload: Record<string, unknown>, @Headers('paytabs-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('PAYTABS', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @Post('webhook/tabby')
  tabbyWebhook(@Body() payload: Record<string, unknown>, @Headers('tabby-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('TABBY', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @Post('webhook/tamara')
  tamaraWebhook(@Body() payload: Record<string, unknown>, @Headers('tamara-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('TAMARA', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('refund')
  refund(@Req() req: AuthenticatedRequest, @Body() dto: RefundPaymentDto) {
    return this.service.refund(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/transactions')
  transactions(@Req() req: AuthenticatedRequest) {
    return this.service.getAdminTransactions(req.user.roles ?? []);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getPaymentById(id);
  }
}
