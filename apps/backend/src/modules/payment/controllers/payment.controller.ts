import { BadRequestException, Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('payment')
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get('health')
  health() {
    return this.service.health();
  }

  @ApiBearerAuth()
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePaymentDto, @Headers('idempotency-key') idempotencyKey?: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return this.service.createPayment(dto, idempotencyKey);
  }
}
