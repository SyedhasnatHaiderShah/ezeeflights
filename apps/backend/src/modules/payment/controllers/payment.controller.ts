import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { PaymentRefundRequestDto } from '../dto/payment-refund-request.dto';
import { RefundPaymentDto } from '../dto/refund-payment.dto';
import { WalletHistoryDto } from '../dto/wallet-history.dto';
import { WalletTopUpDto } from '../dto/wallet-topup.dto';
import { PaymentService } from '../services/payment.service';
import { WalletService } from '../wallet.service';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('Payments')
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(
    private readonly service: PaymentService,
    private readonly walletService: WalletService,
  ) {}

  @ApiOperation({ summary: 'Payment service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiOperation({ summary: 'Initiate a payment for a booking' })
  @ApiResponse({ status: 200, description: 'Payment session created, returns checkout URL' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  initiate(@Req() req: AuthenticatedRequest, @Body() dto: InitiatePaymentDto) {
    return this.service.processPayment(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get my wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet data with balance' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallet/me')
  async walletMe(@Req() req: AuthenticatedRequest) {
    const wallet = await this.walletService.getWallet(req.user.userId);
    return { wallet, balance: wallet.balance };
  }

  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiResponse({ status: 200, description: 'Paginated wallet transactions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wallet/transactions')
  walletTransactions(@Req() req: AuthenticatedRequest, @Query() query: WalletHistoryDto) {
    return this.walletService.getTransactionHistory(req.user.userId, query.limit, query.offset);
  }

  @ApiOperation({ summary: 'Top up wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet topped up' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wallet/topup')
  walletTopup(@Req() req: AuthenticatedRequest, @Body() dto: WalletTopUpDto) {
    return this.walletService.topUp(req.user.userId, dto.amount, dto.currency, dto.paymentMethodId);
  }

  @ApiOperation({ summary: 'Confirm a payment by payment ID' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  confirmPayment(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.service.confirmPayment(id, dto.paymentIntentId);
  }

  @ApiOperation({ summary: 'Refund a specific payment' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Refund initiated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/refund')
  refundById(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: PaymentRefundRequestDto) {
    return this.service.refundByPaymentId(req.user.userId, id, dto.amount, req.user.roles ?? []);
  }

  @ApiOperation({ summary: 'Stripe webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @Post('webhook/stripe')
  stripeWebhook(@Body() payload: Record<string, unknown>, @Headers('stripe-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('STRIPE', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @ApiOperation({ summary: 'Paytabs webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @Post('webhook/paytabs')
  paytabsWebhook(@Body() payload: Record<string, unknown>, @Headers('paytabs-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('PAYTABS', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @ApiOperation({ summary: 'Tabby webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @Post('webhook/tabby')
  tabbyWebhook(@Body() payload: Record<string, unknown>, @Headers('tabby-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('TABBY', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @ApiOperation({ summary: 'Tamara webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @Post('webhook/tamara')
  tamaraWebhook(@Body() payload: Record<string, unknown>, @Headers('tamara-signature') signature?: string, @Headers('x-raw-body') rawBody?: string) {
    return this.service.handleWebhook('TAMARA', payload, signature, rawBody ?? JSON.stringify(payload));
  }

  @ApiOperation({ summary: 'Refund payment by payment ID (user-initiated)' })
  @ApiResponse({ status: 200, description: 'Refund processed' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('refund')
  refund(@Req() req: AuthenticatedRequest, @Body() dto: RefundPaymentDto) {
    return this.service.refund(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get all transactions (admin)' })
  @ApiResponse({ status: 200, description: 'Admin transaction list' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin only' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin/transactions')
  transactions(@Req() req: AuthenticatedRequest) {
    return this.service.getAdminTransactions(req.user.roles ?? []);
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment data' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getPaymentById(id);
  }
}
