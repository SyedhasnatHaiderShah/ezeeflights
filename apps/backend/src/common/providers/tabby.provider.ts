import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaymentEntity } from '../../modules/payment/entities/payment.entity';
import { InitiatePaymentDto } from '../../modules/payment/dto/initiate-payment.dto';
import { BaseProvider } from '../../modules/payment/providers/base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from '../../modules/payment/providers/payment-provider.interface';
import { IPaymentProvider, PaymentIntent, PaymentResult, RefundResult, WebhookEvent } from './payment-provider.factory';

@Injectable()
export class TabbyProvider extends BaseProvider implements PaymentProviderDriver, IPaymentProvider {
  readonly provider = 'TABBY' as const;
  private readonly client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: process.env.TABBY_API_BASE_URL ?? 'https://api.tabby.ai',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent> {
    const raw = await this.createSessionFromSdk(amount, currency, metadata);
    return {
      id: raw.id,
      status: 'PENDING',
      redirectUrl: raw.url,
      amount,
      currency,
      metadata,
      raw: raw.raw,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    return {
      id: paymentIntentId,
      status: 'PENDING',
      raw: { id: paymentIntentId, status: 'authorized' },
    };
  }

  async createSession(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent>;
  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession>;
  async createSession(
    paymentOrAmount: PaymentEntity | number,
    dtoOrCurrency: InitiatePaymentDto | string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentIntent | ProviderSession> {
    if (typeof paymentOrAmount === 'number') {
      return this.createPaymentIntent(paymentOrAmount, dtoOrCurrency as string, metadata ?? {});
    }

    const payment = paymentOrAmount;
    const dto = dtoOrCurrency as InitiatePaymentDto;
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
      redirectUrl: intent.redirectUrl ?? `${dto.successUrl}?provider=tabby&payment_id=${intent.id}`,
      raw: intent.raw,
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const secret = process.env.TABBY_SECRET_KEY;
    if (!secret || !signature) {
      return false;
    }

    const expected = createHmac('sha256', secret).update(rawBody || JSON.stringify(payload)).digest('hex');
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>): {
    paymentId?: string;
    transactionId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  } {
    const status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' =
      payload.status === 'authorized' || payload.status === 'closed'
        ? 'SUCCESS'
        : payload.status === 'rejected'
          ? 'FAILED'
          : payload.status === 'refunded'
            ? 'REFUNDED'
            : 'PENDING';

    return {
      paymentId: typeof payload.payment_id === 'string' ? payload.payment_id : undefined,
      transactionId: String(payload.id ?? payload.payment_id ?? ''),
      status,
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
  async refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  async refund(paymentOrIntentId: PaymentEntity | string, amount?: number): Promise<ProviderRefund | RefundResult> {
    if (!process.env.TABBY_SECRET_KEY) {
      throw new Error('TABBY_SECRET_KEY must be configured');
    }

    const paymentIntentId = typeof paymentOrIntentId === 'string' ? paymentOrIntentId : paymentOrIntentId.transactionId ?? paymentOrIntentId.id;
    const refundAmount = amount ?? (typeof paymentOrIntentId !== 'string' ? paymentOrIntentId.amount : 0);

    const response = await this.client.post(
      `/api/v2/payments/${paymentIntentId}/refunds`,
      { amount: refundAmount.toFixed(2) },
      { headers: { Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}` } },
    );

    const raw = response.data as Record<string, unknown>;
    const isSuccess = raw.status === 'refunded' || raw.status === 'closed';
    const result: RefundResult = {
      id: String(raw.id ?? `refund_${paymentIntentId}`),
      status: isSuccess ? 'SUCCESS' : 'PENDING',
      raw,
    };

    if (typeof paymentOrIntentId === 'string') {
      return result;
    }

    return {
      providerRefundId: result.id,
      status: result.status,
      raw: result.raw,
    };
  }

  createWebhookEvent(payload: Buffer, signature: string): WebhookEvent {
    const parsed = JSON.parse(payload.toString('utf8')) as Record<string, unknown>;
    if (!this.verifyWebhook(parsed, signature, payload.toString('utf8'))) {
      throw new Error('Invalid Tabby webhook signature');
    }
    return {
      id: String(parsed.id ?? parsed.payment_id ?? ''),
      type: String(parsed.status ?? 'tabby.webhook'),
      data: parsed,
      raw: parsed,
    };
  }

  private async createSessionFromSdk(amount: number, currency: string, metadata: Record<string, unknown>) {
    if (!process.env.TABBY_PUBLIC_KEY || !process.env.TABBY_SECRET_KEY) {
      throw new Error('TABBY_PUBLIC_KEY and TABBY_SECRET_KEY must be configured');
    }

    const response = await this.client.post(
      '/api/v2/checkout',
      {
        payment: {
          amount: amount.toFixed(2),
          currency,
          buyer: {
            email: String(metadata.email ?? 'guest@ezeeflights.com'),
            phone: String(metadata.phone ?? '+971500000000'),
          },
          order: {
            reference_id: String(metadata.paymentId ?? `tabby-${Date.now()}`),
            items: [
              {
                title: String(metadata.description ?? 'ezeeFlights booking'),
                quantity: 1,
                unit_price: amount.toFixed(2),
                category: 'travel',
              },
            ],
          },
        },
        lang: 'en',
        merchant_code: process.env.TABBY_PUBLIC_KEY,
        merchant_urls: {
          success: String(metadata.successUrl ?? 'https://example.com/success'),
          cancel: String(metadata.failureUrl ?? 'https://example.com/cancel'),
          failure: String(metadata.failureUrl ?? 'https://example.com/failure'),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TABBY_SECRET_KEY}`,
        },
      },
    );

    const raw = response.data as Record<string, unknown>;
    const products = (raw.configuration as Record<string, unknown> | undefined)?.available_products as Record<string, unknown> | undefined;
    const installments = (products?.installments as Array<Record<string, unknown>> | undefined) ?? [];

    return {
      id: String((raw.payment as Record<string, unknown> | undefined)?.id ?? raw.id ?? ''),
      url: String(installments[0]?.web_url ?? raw.web_url ?? ''),
      raw,
    };
  }
}
