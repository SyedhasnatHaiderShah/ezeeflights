import { Provider } from '@nestjs/common';
import { PaytabsProvider } from './paytabs.provider';
import { StripeProvider } from './stripe.provider';
import { TabbyProvider } from './tabby.provider';
import { TamaraProvider } from './tamara.provider';

export interface PaymentIntent {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  clientSecret?: string;
  redirectUrl?: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface PaymentResult {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  raw: Record<string, unknown>;
}

export interface RefundResult {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  raw: Record<string, unknown>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface IPaymentProvider {
  createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<PaymentResult>;
  refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  createWebhookEvent(payload: Buffer, signature: string): WebhookEvent;
}

export const ACTIVE_PAYMENT_PROVIDER = 'ACTIVE_PAYMENT_PROVIDER';

export const paymentProviderFactory: Provider = {
  provide: ACTIVE_PAYMENT_PROVIDER,
  useFactory: (
    stripe: StripeProvider,
    paytabs: PaytabsProvider,
    tabby: TabbyProvider,
    tamara: TamaraProvider,
  ): IPaymentProvider => {
    const provider = (process.env.PAYMENT_PROVIDER ?? 'stripe').toLowerCase();

    switch (provider) {
      case 'stripe':
        return stripe;
      case 'paytabs':
        return paytabs;
      case 'tabby':
        return tabby;
      case 'tamara':
        return tamara;
      default:
        throw new Error(`Unsupported PAYMENT_PROVIDER: ${provider}`);
    }
  },
  inject: [StripeProvider, PaytabsProvider, TabbyProvider, TamaraProvider],
};
