import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../modules/payment/entities/payment.entity';
import { InitiatePaymentDto } from '../../modules/payment/dto/initiate-payment.dto';
import { BaseProvider } from '../../modules/payment/providers/base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from '../../modules/payment/providers/payment-provider.interface';
import { IPaymentProvider, PaymentIntent, PaymentResult, RefundResult, WebhookEvent } from './payment-provider.factory';

@Injectable()
export class TamaraProvider extends BaseProvider implements PaymentProviderDriver, IPaymentProvider {
  readonly provider = 'TAMARA' as const;
  private readonly client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: 'https://api.tamara.co',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent> {
    if (!process.env.TAMARA_API_KEY) {
      throw new Error('TAMARA_API_KEY is not configured');
    }

    const response = await this.client.post(
      '/checkout',
      {
        order_reference_id: String(metadata.paymentId ?? `tamara-${Date.now()}`),
        total_amount: { amount: String(amount), currency },
        description: String(metadata.description ?? 'ezeeFlights booking'),
        country_code: 'AE',
        payment_type: 'PAY_BY_INSTALMENTS',
        instalments: 3,
        locale: 'en_US',
        items: [
          {
            reference_id: String(metadata.bookingId ?? metadata.paymentId ?? 'booking'),
            type: 'Digital',
            name: String(metadata.description ?? 'Flight booking'),
            sku: String(metadata.bookingId ?? 'booking'),
            quantity: 1,
            unit_price: { amount: String(amount), currency },
            total_amount: { amount: String(amount), currency },
          },
        ],
        consumer: {
          email: String(metadata.email ?? 'guest@ezeeflights.com'),
          first_name: 'Guest',
          last_name: 'User',
          phone_number: '+971500000000',
        },
        billing_address: { first_name: 'Guest', last_name: 'User', phone_number: '+971500000000', country_code: 'AE' },
        shipping_address: { first_name: 'Guest', last_name: 'User', phone_number: '+971500000000', country_code: 'AE' },
        merchant_url: {
          success: String(metadata.successUrl ?? `${process.env.TAMARA_MERCHANT_URL ?? 'https://merchant.example.com'}/success`),
          failure: String(metadata.failureUrl ?? `${process.env.TAMARA_MERCHANT_URL ?? 'https://merchant.example.com'}/failure`),
          cancel: String(metadata.failureUrl ?? `${process.env.TAMARA_MERCHANT_URL ?? 'https://merchant.example.com'}/cancel`),
          notification: `${process.env.TAMARA_MERCHANT_URL ?? 'https://merchant.example.com'}/webhook/tamara`,
        },
      },
      { headers: { Authorization: `Bearer ${process.env.TAMARA_API_KEY}` } },
    );

    const raw = response.data as Record<string, unknown>;
    return {
      id: String(raw.order_id ?? raw.checkout_id ?? ''),
      status: 'PENDING',
      redirectUrl: String(raw.checkout_url ?? ''),
      amount,
      currency,
      metadata,
      raw,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    return {
      id: paymentIntentId,
      status: 'PENDING',
      raw: { order_id: paymentIntentId, status: 'awaiting-callback' },
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
      redirectUrl: `${dto.successUrl}?provider=tamara&order_id=${intent.id}`,
      raw: intent.raw,
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const apiKey = process.env.TAMARA_API_KEY;
    if (!apiKey || !signature) {
      return false;
    }

    const expected = this.sign(apiKey, rawBody || JSON.stringify(payload));
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>): {
    paymentId?: string;
    transactionId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  } {
    const status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' =
      payload.status === 'captured'
        ? 'SUCCESS'
        : payload.status === 'canceled'
          ? 'FAILED'
          : payload.status === 'refunded'
            ? 'REFUNDED'
            : 'PENDING';

    return {
      paymentId: typeof payload.order_reference_id === 'string' ? payload.order_reference_id : undefined,
      transactionId: String(payload.order_id ?? payload.capture_id ?? ''),
      status,
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
  async refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  async refund(paymentOrIntentId: PaymentEntity | string, amount?: number): Promise<ProviderRefund | RefundResult> {
    if (!process.env.TAMARA_API_KEY) {
      throw new Error('TAMARA_API_KEY is not configured');
    }

    const paymentIntentId = typeof paymentOrIntentId === 'string' ? paymentOrIntentId : paymentOrIntentId.transactionId ?? paymentOrIntentId.id;
    const refundAmount = amount ?? (typeof paymentOrIntentId !== 'string' ? paymentOrIntentId.amount : 0);
    const currency = typeof paymentOrIntentId !== 'string' ? paymentOrIntentId.currency : 'AED';

    const response = await this.client.post(
      `/orders/${paymentIntentId}/refunds`,
      {
        total_amount: { amount: String(refundAmount), currency },
        comment: 'Customer refund',
      },
      { headers: { Authorization: `Bearer ${process.env.TAMARA_API_KEY}` } },
    );

    const raw = response.data as Record<string, unknown>;
    const isSuccess = raw.status === 'fully_refunded' || raw.status === 'partially_refunded';
    const result: RefundResult = {
      id: String(raw.refund_id ?? `refund_${paymentIntentId}`),
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
      throw new Error('Invalid Tamara webhook signature');
    }
    return {
      id: String(parsed.order_id ?? parsed.capture_id ?? ''),
      type: String(parsed.status ?? 'tamara.webhook'),
      data: parsed,
      raw: parsed,
    };
  }
}
