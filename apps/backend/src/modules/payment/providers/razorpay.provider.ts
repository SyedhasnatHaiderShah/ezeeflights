import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PaymentEntity } from "../entities/payment.entity";
import { InitiatePaymentDto } from "../dto/initiate-payment.dto";
import { BaseProvider } from "./base.provider";
import {
  PaymentProviderDriver,
  ProviderRefund,
  ProviderSession,
} from "./payment-provider.interface";
import {
  IPaymentProvider,
  PaymentIntent,
  PaymentResult,
  RefundResult,
  WebhookEvent,
} from "../../../common/providers/payment-provider.factory";

import { CurrencyService } from "../../public/currency.service";

// Try requiring razorpay. We use require since its types might be missing or commonjs.
import Razorpay = require("razorpay");

@Injectable()
export class RazorpayProvider
  extends BaseProvider
  implements PaymentProviderDriver, IPaymentProvider
{
  readonly provider = "RAZORPAY" as const;
  private readonly logger = new Logger(RazorpayProvider.name);
  private readonly client: any;

  constructor(private readonly currencyService: CurrencyService) {
    super();
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    try {
      if (keyId && keySecret) {
        this.client = new Razorpay({ key_id: keyId, key_secret: keySecret });
      } else {
        console.warn(
          "[RazorpayProvider] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Razorpay integration will not work.",
        );
      }
    } catch (e: any) {
      console.error(
        "[RazorpayProvider] Failed to initialize Razorpay SDK:",
        e.message,
      );
    }

    // Store keys on client object for createPaymentIntent fetch
    if (!this.client) this.client = {};
    this.client.key_id = keyId;
    this.client.key_secret = keySecret;
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, unknown>,
  ): Promise<PaymentIntent> {
    // Resolve Razorpay order currency dynamically based on active domain/currency
    let orderCurrency = "USD";
    const activeHost = String(
      metadata.test_host || metadata.testHost || "",
    ).toLowerCase();
    if (
      currency.toUpperCase() === "GBP" ||
      activeHost.includes("uk.ezeeflights.com")
    ) {
      orderCurrency = "GBP";
    } else if (
      currency.toUpperCase() === "CAD" ||
      activeHost.includes("ezeeflights.ca")
    ) {
      orderCurrency = "CAD";
    } else if (
      currency.toUpperCase() === "AED" ||
      activeHost.includes("ezeeflights.ae")
    ) {
      orderCurrency = "AED";
    } else if (
      currency.toUpperCase() === "TRY" ||
      activeHost.includes("tr.ezeeflights.com")
    ) {
      orderCurrency = "TRY";
    } else if (
      currency.toUpperCase() === "INR" ||
      activeHost.includes("in.ezeeflights.com")
    ) {
      orderCurrency = "INR";
    }
    let orderAmount = amount;

    this.logger.log(
      `[createPaymentIntent] START | amount=${amount} ${currency} | targetCurrency=${orderCurrency} | ` +
        `metadata.paymentId=${metadata.paymentId ?? "n/a"} | metadata.bookingId=${metadata.bookingId ?? "n/a"}`,
    );

    if (metadata.paymentFlow === "bid_deposit" || metadata.bidId) {
      this.logger.log(
        `[createPaymentIntent] Cheap Bid detected in payment metadata: ` +
          `bidId=${metadata.bidId ?? "n/a"}, paymentFlow=${metadata.paymentFlow ?? "n/a"}`,
      );
    }

    // If the incoming amount is not already in the target order currency, convert it
    if (currency.toUpperCase() !== orderCurrency) {
      try {
        const rates = await this.currencyService.getRates();
        const sourceRate = rates[currency.toUpperCase()] || 1;
        const targetRate = rates[orderCurrency] || 1;
        orderAmount = (amount / sourceRate) * targetRate;
        this.logger.log(
          `[createPaymentIntent] Currency conversion | ${currency} -> ${orderCurrency} | ` +
            `sourceRate=${sourceRate} targetRate=${targetRate} | ` +
            `original=${amount} converted=${orderAmount.toFixed(4)}`,
        );
      } catch (e) {
        this.logger.warn(
          `[createPaymentIntent] Currency conversion to ${orderCurrency} failed, using raw amount:`,
          e,
        );
        // orderAmount stays as-is, still charge in orderCurrency
      }
    } else {
      this.logger.log(
        `[createPaymentIntent] Currency is already ${orderCurrency}, no conversion needed`,
      );
    }

    this.logger.log(
      `[Checkout Payment] Amount: ${orderAmount.toFixed(2)}, Currency: ${orderCurrency}`,
    );

    const minorAmount = Math.round(orderAmount * 100);
    this.logger.log(
      `[createPaymentIntent] Charge amount | ${minorAmount} minor units (${(minorAmount / 100).toFixed(2)} ${orderCurrency})`,
    );

    const crypto = require("crypto");
    const receipt = "rcpt_" + crypto.randomBytes(4).toString("hex");

    try {
      const authHeader =
        "Basic " +
        Buffer.from(`${this.client.key_id}:${this.client.key_secret}`).toString(
          "base64",
        );

      this.logger.log(
        `[createPaymentIntent] Calling Razorpay API | POST https://api.razorpay.com/v1/orders | ` +
          `amount=${minorAmount} currency=${orderCurrency} receipt=${receipt} | ` +
          `keyId prefix=${(this.client.key_id as string)?.substring(0, 8)}...`,
      );

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          "User-Agent": "EzeeFlights-Backend/1.0",
        },
        body: JSON.stringify({
          amount: minorAmount,
          currency: orderCurrency,
          receipt: receipt,
          notes: this.stringifyMetadata(metadata),
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        this.logger.error(
          `[createPaymentIntent] Razorpay API ERROR | status=${response.status} | ` +
            `body=${responseText.substring(0, 500)} | ` +
            `DIAGNOSTIC: If status=401, keys are wrong. If status=400, check currency/amount. ` +
            `If status=503, Razorpay API is down. For Pakistan/international issues, ensure ` +
            `"International Payments" is enabled in Razorpay Dashboard > Settings.`,
        );
        console.error("--- RAW RAZORPAY ERROR ---");
        console.error(`Status: ${response.status}`);
        console.error(`Body: ${responseText}`);
        console.error("--------------------------");
        if (response.status === 403 || response.status === 401) {
          throw new ServiceUnavailableException(
            "Razorpay payment service is temporarily unavailable. Please choose another payment method or contact customer support.",
          );
        }
        throw new Error(
          `Razorpay API returned ${response.status}: ${responseText.substring(0, 200)}`,
        );
      }

      const order = JSON.parse(responseText);
      this.logger.log(
        `[createPaymentIntent] SUCCESS | orderId=${order.id} | status=${order.status} | ` +
          `amount=${order.amount} currency=${order.currency}`,
      );

      return {
        id: order.id,
        status: "PENDING",
        clientSecret: order.id,
        amount: orderAmount,
        currency: orderCurrency,
        metadata,
        raw: order as Record<string, unknown>,
      };
    } catch (err: any) {
      this.logger.error(
        `[createPaymentIntent] FAILED | ${err.message}`,
        err.stack,
      );
      if (err && typeof err.getStatus === "function") {
        throw err;
      }
      throw new ServiceUnavailableException(
        `Razorpay payment initialization failed: ${err.message}`,
      );
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    // confirmation for Razorpay is usually done via webhook or client signature verification,
    // but this generic method can just return pending/success if we fetch the order.
    try {
      if (!this.client || !this.client.orders) {
        throw new Error("Razorpay SDK is not initialized (missing API keys).");
      }
      const order = await this.client.orders.fetch(paymentIntentId);
      return {
        id: order.id,
        status: order.status === "paid" ? "SUCCESS" : "PENDING",
        raw: order as Record<string, unknown>,
      };
    } catch (e: any) {
      return {
        id: paymentIntentId,
        status: "FAILED",
        raw: { error: e.message },
      };
    }
  }

  async createSession(
    payment: PaymentEntity,
    dto: InitiatePaymentDto,
  ): Promise<ProviderSession> {
    const intent = await this.createPaymentIntent(
      payment.amount,
      payment.currency,
      {
        paymentId: payment.id,
        bookingId: payment.bookingId,
        userId: payment.userId,
        ...(payment.metadata ?? {}),
        ...(dto.metadata ?? {}),
      },
    );

    return {
      providerPaymentId: intent.id,
      redirectUrl: `${dto.successUrl}?provider=razorpay&payment_intent=${intent.id}`,
      raw: intent.raw,
    };
  }

  verifyWebhook(
    payload: Record<string, unknown>,
    signature: string | undefined,
    rawBody: string,
  ): boolean {
    if (!signature) return false;

    const secret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      "";
    if (!secret) return false;

    // Razorpay signature validation: HMAC hex of raw body
    const expected = this.sign(secret, rawBody);
    return this.compareSignatures(signature, expected);
  }

  parseWebhook(payload: Record<string, unknown>): {
    paymentId?: string;
    transactionId: string;
    status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  } {
    // Default structure for Razorpay webhooks
    const payloadObj = payload.payload as any;
    const paymentData = payloadObj?.payment?.entity;

    return {
      paymentId: paymentData?.notes?.paymentId,
      transactionId: paymentData?.id || (payload.id as string),
      status: this.mapWebhookStatus(payload.event as string),
    };
  }

  async refund(payment: PaymentEntity, amount: number): Promise<ProviderRefund>;
  async refund(paymentIntentId: string, amount?: number): Promise<RefundResult>;
  async refund(
    paymentOrIntentId: PaymentEntity | string,
    amount?: number,
  ): Promise<ProviderRefund | RefundResult> {
    const paymentId =
      typeof paymentOrIntentId === "string"
        ? paymentOrIntentId
        : (paymentOrIntentId.transactionId ?? paymentOrIntentId.id);
    const minorAmount = amount ? Math.round(amount * 100) : undefined;

    try {
      if (!this.client || !this.client.payments) {
        throw new Error("Razorpay SDK is not initialized (missing API keys).");
      }
      const refund = await this.client.payments.refund(
        paymentId,
        minorAmount ? { amount: minorAmount } : {},
      );

      const status =
        refund.status === "processed"
          ? "SUCCESS"
          : refund.status === "failed"
            ? "FAILED"
            : "PENDING";

      if (typeof paymentOrIntentId === "string") {
        return {
          id: refund.id,
          status,
          raw: refund as Record<string, unknown>,
        };
      }
      return {
        providerRefundId: refund.id,
        status,
        raw: refund as Record<string, unknown>,
      };
    } catch (e: any) {
      if (typeof paymentOrIntentId === "string") {
        return { id: paymentId, status: "FAILED", raw: { error: e.message } };
      }
      return {
        providerRefundId: paymentId,
        status: "FAILED",
        raw: { error: e.message },
      };
    }
  }

  createWebhookEvent(payload: Buffer, signature: string): WebhookEvent {
    const data = JSON.parse(payload.toString());
    return {
      id: data.id || `rzp_evt_${Date.now()}`,
      type: data.event || "unknown",
      data: data as Record<string, unknown>,
      raw: data as Record<string, unknown>,
    };
  }

  /**
   * Used to verify client-side confirmations for hotel and insurance payments.
   */
  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<{ status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" }> {
    try {
      if (!this.client || !this.client.orders) {
        throw new Error("Razorpay SDK is not initialized (missing API keys).");
      }
      const order = await this.client.orders.fetch(paymentIntentId);
      return { status: order.status === "paid" ? "SUCCESS" : "PENDING" };
    } catch (e) {
      return { status: "FAILED" };
    }
  }

  private stringifyMetadata(
    metadata: Record<string, unknown>,
  ): Record<string, string> {
    return Object.entries(metadata).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      },
      {},
    );
  }

  private mapWebhookStatus(
    event: string,
  ): "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" {
    if (event === "payment.captured") return "SUCCESS";
    if (event === "payment.failed") return "FAILED";
    if (event === "refund.processed") return "REFUNDED";
    return "PENDING";
  }
}
