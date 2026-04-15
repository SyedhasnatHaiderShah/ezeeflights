import { Injectable } from '@nestjs/common';
import Stripe = require('stripe');
import { PaymentEntity } from '../../modules/payment/entities/payment.entity';
import { InitiatePaymentDto } from '../../modules/payment/dto/initiate-payment.dto';
import { BaseProvider } from '../../modules/payment/providers/base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from '../../modules/payment/providers/payment-provider.interface';
import { IPaymentProvider, PaymentIntent, PaymentResult, RefundResult, WebhookEvent } from './payment-provider.factory';

@Injectable()
export class StripeProvider extends BaseProvider implements PaymentProviderDriver, IPaymentProvider {
  readonly provider = 'STRIPE' as const;
  private readonly client: InstanceType<typeof Stripe>;

  constructor() {
    super();
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing required env var: STRIPE_SECRET_KEY. Add it to your .env file.');
    }
    this.client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent> {
    const intent = await this.client.paymentIntents.create({
      amount: this.toMinorUnit(amount),
      currency: currency.toLowerCase(),
      metadata: this.stringifyMetadata(metadata),
      payment_method_types: ['card'],
      confirm: false,
    });

    return {
      id: intent.id,
      status: this.mapIntentStatus(intent.status),
      clientSecret: intent.client_secret ?? undefined,
      amount,
      currency,
      metadata,
      raw: intent as unknown as Record<string, unknown>,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    const intent = await this.client.paymentIntents.confirm(paymentIntentId, {
      payment_method: 'pm_card_visa',
    });

    return {
      id: intent.id,
      status: this.mapIntentStatus(intent.status),
      raw: intent as unknown as Record<string, unknown>,
    };
  }

  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession> {
    const intent = await this.createPaymentIntent(payment.amount, payment.currency, {
      paymentId: payment.id,
      bookingId: payment.bookingId,
      userId: payment.userId,
      successUrl: dto.successUrl,
      failureUrl: dto.failureUrl,
      ...(payment.metadata ?? {}),
      ...(dto.metadata ?? {}),
    });

    return {
      providerPaymentId: intent.id,
      redirectUrl: `${dto.successUrl}?provider=stripe&payment_intent=${intent.id}`,
      raw: intent.raw,
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    if (!signature) {
      return false;
    }

    try {
      this.createWebhookEvent(Buffer.from(rawBody || JSON.stringify(payload)), signature);
      return true;
    } catch {
      return false;
    }
  }

  parseWebhook(payload: Record<string, unknown>): {
    paymentId?: string;
    transactionId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  } {
    const data = (payload.data as Record<string, unknown>) ?? payload;
    const metadata = (data.metadata as Record<string, unknown>) ?? {};
    return {
      paymentId: typeof metadata.paymentId === 'string' ? metadata.paymentId : undefined,
      transactionId: String(data.id ?? data.payment_intent ?? ''),
      status: this.mapIntentStatus(String(data.status ?? 'requires_payment_method')),
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
  async refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  async refund(paymentOrIntentId: PaymentEntity | string, amount?: number): Promise<ProviderRefund | RefundResult> {
    const paymentIntentId = typeof paymentOrIntentId === 'string' ? paymentOrIntentId : paymentOrIntentId.transactionId ?? paymentOrIntentId.id;
    const refund = await this.client.refunds.create({
      payment_intent: paymentIntentId,
      amount: typeof amount === 'number' ? this.toMinorUnit(amount) : undefined,
    });

    if (typeof paymentOrIntentId === 'string') {
      return {
        id: refund.id,
        status: refund.status === 'succeeded' ? 'SUCCESS' : refund.status === 'failed' ? 'FAILED' : 'PENDING',
        raw: refund as unknown as Record<string, unknown>,
      };
    }

    return {
      providerRefundId: refund.id,
      status: refund.status === 'succeeded' ? 'SUCCESS' : refund.status === 'failed' ? 'FAILED' : 'PENDING',
      raw: refund as unknown as Record<string, unknown>,
    };
  }

  createWebhookEvent(payload: Buffer, signature: string): WebhookEvent {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = this.client.webhooks.constructEvent(payload, signature, secret);
    return {
      id: event.id,
      type: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
      raw: event as unknown as Record<string, unknown>,
    };
  }

  private stringifyMetadata(metadata: Record<string, unknown>): Record<string, string> {
    return Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = String(value);
      }
      return acc;
    }, {});
  }

  private toMinorUnit(amount: number): number {
    return Math.round(amount * 100);
  }

  private mapIntentStatus(status: string): 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' {
    if (status === 'succeeded') return 'SUCCESS';
    if (status === 'canceled') return 'FAILED';
    if (status === 'refunded') return 'REFUNDED';
    return 'PENDING';
  }
}
