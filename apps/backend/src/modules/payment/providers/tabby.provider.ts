import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { BaseProvider } from './base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from './payment-provider.interface';

@Injectable()
export class TabbyProvider extends BaseProvider implements PaymentProviderDriver {
  readonly provider = 'TABBY' as const;

  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession> {
    if (!process.env.TABBY_API_KEY) throw new Error('TABBY_API_KEY is not configured');
    const providerPaymentId = `tb_${payment.id.replace(/-/g, '').slice(0, 24)}`;
    return {
      providerPaymentId,
      redirectUrl: `${dto.successUrl}?provider=tabby&payment_id=${providerPaymentId}`,
      raw: { buyer_history: { registered_since: new Date().toISOString() }, order: { amount: payment.amount } },
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const key = process.env.TABBY_API_KEY;
    if (!key) return false;
    const expected = this.sign(key, rawBody || JSON.stringify(payload));
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>) {
    return {
      paymentId: typeof payload.payment_id === 'string' ? payload.payment_id : undefined,
      transactionId: String(payload.id ?? payload.payment_id ?? ''),
      status: payload.status === 'authorized' || payload.status === 'closed' ? 'SUCCESS' : payload.status === 'rejected' ? 'FAILED' : payload.status === 'refunded' ? 'REFUNDED' : 'PENDING',
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund> {
    return {
      providerRefundId: `tbr_${payment.id.replace(/-/g, '').slice(0, 24)}`,
      status: 'SUCCESS',
      raw: { amount },
    };
  }
}
