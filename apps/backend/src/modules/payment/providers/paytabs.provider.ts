import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { BaseProvider } from './base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from './payment-provider.interface';

@Injectable()
export class PaytabsProvider extends BaseProvider implements PaymentProviderDriver {
  readonly provider = 'PAYTABS' as const;

  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession> {
    if (!process.env.PAYTABS_SERVER_KEY) throw new Error('PAYTABS_SERVER_KEY is not configured');
    const providerPaymentId = `pt_${payment.id.replace(/-/g, '').slice(0, 24)}`;
    return {
      providerPaymentId,
      redirectUrl: `${dto.successUrl}?provider=paytabs&tran_ref=${providerPaymentId}`,
      raw: { tran_type: 'sale', amount: payment.amount, currency: payment.currency },
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const serverKey = process.env.PAYTABS_SERVER_KEY;
    if (!serverKey) return false;
    const expected = this.sign(serverKey, rawBody || JSON.stringify(payload));
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>) {
    return {
      paymentId: typeof payload.payment_id === 'string' ? payload.payment_id : undefined,
      transactionId: String(payload.tran_ref ?? payload.id ?? ''),
      status: payload.payment_result === 'REFUNDED' ? 'REFUNDED' : payload.payment_result === 'DECLINED' ? 'FAILED' : payload.payment_result === 'SUCCESS' ? 'SUCCESS' : 'PENDING',
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund> {
    return {
      providerRefundId: `ptr_${payment.id.replace(/-/g, '').slice(0, 24)}`,
      status: 'SUCCESS',
      raw: { amount, tranRef: payment.transactionId },
    };
  }
}
