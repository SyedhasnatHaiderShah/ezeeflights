import { Injectable } from '@nestjs/common';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from './payment-provider.interface';
import { PaymentEntity } from '../entities/payment.entity';
import { IPaymentProvider, PaymentIntent, PaymentResult, RefundResult, WebhookEvent } from '../../../common/providers/payment-provider.factory';

@Injectable()
export class MockProvider implements PaymentProviderDriver, IPaymentProvider {
  readonly provider = 'MOCK' as any;

  async createSession(payment: PaymentEntity): Promise<ProviderSession> {
    return {
      providerPaymentId: `mock_${Math.random().toString(36).substring(7)}`,
      redirectUrl: `/payment/success?id=${payment.id}`,
      raw: { mock: true },
    };
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent> {
    const id = `mock_intent_${Math.random().toString(36).substring(7)}`;
    return {
      id,
      status: 'PENDING',
      clientSecret: `${id}_secret`,
      amount,
      currency,
      metadata,
      raw: { mock: true }
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    return {
      id: paymentIntentId,
      status: 'SUCCESS',
      raw: { mock: true }
    };
  }

  verifyWebhook(_payload: Record<string, unknown>, _signature: string | undefined, _rawBody: string): boolean {
    return true;
  }

  parseWebhook(payload: any) {
    return {
      transactionId: payload.transactionId,
      status: 'SUCCESS' as any,
      amount: payload.amount,
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
  async refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  async refund(paymentOrIntentId: PaymentEntity | string, amount?: number): Promise<ProviderRefund | RefundResult> {
    const id = typeof paymentOrIntentId === 'string' ? paymentOrIntentId : `mock_ref_${Math.random().toString(36).substring(7)}`;
    
    if (typeof paymentOrIntentId === 'string') {
      return {
        id: `mock_refund_${Math.random().toString(36).substring(7)}`,
        status: 'SUCCESS',
        raw: { mock: true }
      };
    }

    return {
      status: 'SUCCESS',
      providerRefundId: `mock_ref_${Math.random().toString(36).substring(7)}`,
      raw: { mock: true },
    };
  }

  createWebhookEvent(payload: Buffer, signature: string): WebhookEvent {
    return {
      id: 'mock_evt_123',
      type: 'payment_intent.succeeded',
      data: JSON.parse(payload.toString()),
      raw: { mock: true }
    };
  }
}
