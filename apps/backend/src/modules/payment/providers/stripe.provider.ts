import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { BaseProvider } from './base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from './payment-provider.interface';

@Injectable()
export class StripeProvider extends BaseProvider implements PaymentProviderDriver {
  readonly provider = 'STRIPE' as const;

  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession> {
    const token = process.env.STRIPE_SECRET_KEY;
    if (!token) throw new Error('STRIPE_SECRET_KEY is not configured');

    const providerPaymentId = `cs_${payment.id.replace(/-/g, '').slice(0, 24)}`;
    return {
      providerPaymentId,
      redirectUrl: `${dto.successUrl}?provider=stripe&session_id=${providerPaymentId}`,
      raw: { mode: 'payment', amount: payment.amount, currency: payment.currency.toLowerCase() },
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = this.sign(secret, rawBody || JSON.stringify(payload));
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>) {
    const data = (payload.data as Record<string, unknown>) ?? payload;
    const metadata = (data.metadata as Record<string, unknown>) ?? {};
    return {
      paymentId: typeof metadata.paymentId === 'string' ? metadata.paymentId : undefined,
      transactionId: String(data.id ?? data.payment_intent ?? ''),
      status: data.status === 'succeeded' ? 'SUCCESS' : data.status === 'refunded' ? 'REFUNDED' : data.status === 'failed' ? 'FAILED' : 'PENDING',
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund> {
    return {
      providerRefundId: `re_${payment.id.replace(/-/g, '').slice(0, 24)}`,
      status: 'SUCCESS',
      raw: { amount, transactionId: payment.transactionId },
    };
  }
}
