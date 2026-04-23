import { Injectable } from '@nestjs/common';
import { PaymentProviderDriver, ProviderSession } from './payment-provider.interface';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class MockProvider implements PaymentProviderDriver {
  readonly provider = 'MOCK' as any;

  async createSession(payment: PaymentEntity): Promise<ProviderSession> {
    return {
      providerPaymentId: `mock_${Math.random().toString(36).substring(7)}`,
      redirectUrl: `/payment/success?id=${payment.id}`,
      raw: { mock: true },
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

  async refund(): Promise<{ status: 'SUCCESS'; providerRefundId: string; raw: any }> {
    return {
      status: 'SUCCESS',
      providerRefundId: `mock_ref_${Math.random().toString(36).substring(7)}`,
      raw: { mock: true },
    };
  }
}
