import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentService } from './services/payment.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('payment-legacy')
@Controller({ path: 'payment', version: '1' })
export class LegacyPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(req.user.userId, dto);
  }
}
