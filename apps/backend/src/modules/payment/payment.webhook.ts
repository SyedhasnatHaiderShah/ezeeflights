import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './entities/payment.entity';
import { PaymentService } from './services/payment.service';

@Injectable()
export class PaymentWebhookHandler {
  constructor(private readonly paymentService: PaymentService) {}

  process(provider: PaymentProvider, payload: Record<string, unknown>, signature: string | undefined, rawBody: string) {
    return this.paymentService.handleWebhook(provider, payload, signature, rawBody);
  }
}
