import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../../modules/payment/entities/payment.entity';
import { InitiatePaymentDto } from '../../modules/payment/dto/initiate-payment.dto';
import { BaseProvider } from '../../modules/payment/providers/base.provider';
import { PaymentProviderDriver, ProviderRefund, ProviderSession } from '../../modules/payment/providers/payment-provider.interface';
import { IPaymentProvider, PaymentIntent, PaymentResult, RefundResult, WebhookEvent } from './payment-provider.factory';

@Injectable()
export class PaytabsProvider extends BaseProvider implements PaymentProviderDriver, IPaymentProvider {
  readonly provider = 'PAYTABS' as const;
  private readonly client: AxiosInstance;

  constructor() {
    super();
    this.client = axios.create({
      baseURL: 'https://secure.paytabs.com',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentIntent> {
    const serverKey = process.env.PAYTABS_SERVER_KEY;
    const profileId = process.env.PAYTABS_PROFILE_ID;
    if (!serverKey || !profileId) {
      throw new Error('PAYTABS_SERVER_KEY and PAYTABS_PROFILE_ID must be configured');
    }

    const response = await this.client.post(
      '/payment/request',
      {
        profile_id: Number(profileId),
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: String(metadata.paymentId ?? `cart-${Date.now()}`),
        cart_currency: currency,
        cart_amount: amount,
        cart_description: String(metadata.description ?? 'ezeeFlights payment'),
        paypage_lang: 'en',
      },
      {
        headers: {
          Authorization: serverKey,
        },
      },
    );

    const raw = response.data as Record<string, unknown>;
    return {
      id: String(raw.tran_ref ?? raw.id ?? ''),
      status: 'PENDING',
      redirectUrl: typeof raw.redirect_url === 'string' ? raw.redirect_url : undefined,
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
      raw: { tran_ref: paymentIntentId, status: 'awaiting-callback' },
    };
  }

  async createSession(payment: PaymentEntity, dto: InitiatePaymentDto): Promise<ProviderSession> {
    const intent = await this.createPaymentIntent(payment.amount, payment.currency, {
      paymentId: payment.id,
      bookingId: payment.bookingId,
      userId: payment.userId,
      description: `Booking ${payment.bookingId}`,
      successUrl: dto.successUrl,
      failureUrl: dto.failureUrl,
      ...(payment.metadata ?? {}),
      ...(dto.metadata ?? {}),
    });

    return {
      providerPaymentId: intent.id,
      redirectUrl: intent.redirectUrl ?? `${dto.successUrl}?provider=paytabs&tran_ref=${intent.id}`,
      raw: intent.raw,
    };
  }

  verifyWebhook(payload: Record<string, unknown>, signature: string | undefined, rawBody: string): boolean {
    const serverKey = process.env.PAYTABS_SERVER_KEY;
    if (!serverKey || !signature) {
      return false;
    }

    const expected = this.sign(serverKey, rawBody || JSON.stringify(payload));
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>): {
    paymentId?: string;
    transactionId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  } {
    const result = payload.payment_result as Record<string, unknown> | string | undefined;
    const responseStatus =
      typeof result === 'string'
        ? result
        : typeof result?.response_status === 'string'
          ? result.response_status
          : typeof payload.payment_result === 'string'
            ? payload.payment_result
            : 'PENDING';

    const status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' =
      responseStatus === 'A' || responseStatus === 'SUCCESS'
        ? 'SUCCESS'
        : responseStatus === 'D' || responseStatus === 'DECLINED'
          ? 'FAILED'
          : responseStatus === 'REFUNDED'
            ? 'REFUNDED'
            : 'PENDING';

    return {
      paymentId: typeof payload.cart_id === 'string' ? payload.cart_id : undefined,
      transactionId: String(payload.tran_ref ?? payload.id ?? ''),
      status,
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
  async refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  async refund(paymentOrIntentId: PaymentEntity | string, amount?: number): Promise<ProviderRefund | RefundResult> {
    const serverKey = process.env.PAYTABS_SERVER_KEY;
    const profileId = process.env.PAYTABS_PROFILE_ID;
    const paymentIntentId = typeof paymentOrIntentId === 'string' ? paymentOrIntentId : paymentOrIntentId.transactionId ?? paymentOrIntentId.id;

    if (!serverKey || !profileId) {
      throw new Error('PAYTABS_SERVER_KEY and PAYTABS_PROFILE_ID must be configured');
    }

    const refundAmount = amount ?? (typeof paymentOrIntentId !== 'string' ? paymentOrIntentId.amount : 0);
    const response = await this.client.post(
      '/payment/request',
      {
        profile_id: Number(profileId),
        tran_type: 'refund',
        tran_class: 'ecom',
        tran_ref: paymentIntentId,
        cart_id: `refund-${paymentIntentId}`,
        cart_currency: typeof paymentOrIntentId !== 'string' ? paymentOrIntentId.currency : 'AED',
        cart_amount: refundAmount,
        cart_description: 'Refund',
      },
      { headers: { Authorization: serverKey } },
    );

    const raw = response.data as Record<string, unknown>;
    const isSuccess = (raw.payment_result as Record<string, unknown> | undefined)?.response_status === 'A';
    const result: RefundResult = {
      id: String(raw.tran_ref ?? `refund_${paymentIntentId}`),
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
      throw new Error('Invalid PayTabs webhook signature');
    }
    return {
      id: String(parsed.tran_ref ?? parsed.id ?? ''),
      type: String(parsed.payment_result ?? 'paytabs.webhook'),
      data: parsed,
      raw: parsed,
    };
  }
}
