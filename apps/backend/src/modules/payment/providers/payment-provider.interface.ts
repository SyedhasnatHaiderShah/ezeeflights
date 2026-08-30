import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { PaymentEntity, PaymentProvider } from '../entities/payment.entity';

export interface ProviderSession {
  providerPaymentId: string;
  redirectUrl: string;
  raw: Record<string, unknown>;
}

export interface ProviderRefund {
  providerRefundId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  raw: Record<string, unknown>;
}

export interface PaymentProviderDriver {
  readonly provider: PaymentProvider;
  createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession>;
  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean;
  parseWebhook(payload: Record<string, unknown>): { transactionId: string; status: 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PENDING'; paymentId?: string };
  refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
}
