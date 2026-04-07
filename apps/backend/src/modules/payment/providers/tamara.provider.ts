import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { BaseProvider } from './base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from './payment-provider.interface';

@Injectable()
export class TamaraProvider extends BaseProvider implements PaymentProviderDriver {
  readonly provider = 'TAMARA' as const;

  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession> {
    if (!process.env.TAMARA_API_KEY) throw new Error('TAMARA_API_KEY is not configured');
    const providerPaymentId = `tm_${payment.id.replace(/-/g, '').slice(0, 24)}`;
    return {
      providerPaymentId,
      redirectUrl: `${dto.successUrl}?provider=tamara&order_id=${providerPaymentId}`,
      raw: { order_number: payment.id, total_amount: { amount: payment.amount, currency: payment.currency } },
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const key = process.env.TAMARA_API_KEY;
    if (!key) return false;
    const expected = this.sign(key, rawBody || JSON.stringify(payload));
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>) {
    return {
      paymentId: typeof payload.order_reference_id === 'string' ? payload.order_reference_id : undefined,
      transactionId: String(payload.order_id ?? payload.capture_id ?? ''),
      status: payload.status === 'captured' ? 'SUCCESS' : payload.status === 'canceled' ? 'FAILED' : payload.status === 'refunded' ? 'REFUNDED' : 'PENDING',
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund> {
    return {
      providerRefundId: `tmr_${payment.id.replace(/-/g, '').slice(0, 24)}`,
      status: 'SUCCESS',
      raw: { amount },
    };
  }
}
