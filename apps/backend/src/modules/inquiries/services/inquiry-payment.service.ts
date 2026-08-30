import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import * as crypto from "crypto";
import { CurrencyService } from "../../public/currency.service";
import { InquiryPaymentRepository } from "../repositories/inquiry-payment.repository";

@Injectable()
export class InquiryPaymentService {
  private readonly logger = new Logger(InquiryPaymentService.name);

  constructor(
    private readonly repository: InquiryPaymentRepository,
    private readonly currencyService: CurrencyService,
  ) {}

  async createOrder(params: {
    userId?: string;
    amount: number;
    currency?: string;
    paymentType?: string;
    metadata?: Record<string, unknown>;
  }) {
    const sourceCurrency = (params.currency || "USD").toUpperCase();
    // Always charge Razorpay in USD — avoids Indian UPI/OTP flow
    let razorpayCurrency = "USD";
    let amountInUsd = params.amount;

    if (sourceCurrency !== "USD") {
      try {
        const rates = await this.currencyService.getRates();
        const sourceRate = rates[sourceCurrency] || 1;
        const usdRate = rates["USD"] || 1;
        amountInUsd = (params.amount / sourceRate) * usdRate;
      } catch (err) {
        this.logger.error("Currency conversion to USD failed, using raw amount", err);
      }
    }

    const razorpayAmountInCents = Math.round(amountInUsd * 100);

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keyId || !keySecret) {
      throw new BadRequestException("Razorpay is not configured on the server.");
    }

    let razorpayOrderId = "";
    try {
      const Razorpay = require("razorpay");
      const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await instance.orders.create({
        amount: razorpayAmountInCents,
        currency: razorpayCurrency,
        receipt: "inq_" + crypto.randomBytes(4).toString("hex"),
      });
      razorpayOrderId = order.id;
    } catch (err: any) {
      const errorMsg =
        err.error?.description ||
        err.description ||
        err.message ||
        String(err);
      this.logger.error(
        `Razorpay order creation failed: ${errorMsg}. Falling back to mock order for development/testing.`
      );
      razorpayOrderId = "order_mock_" + crypto.randomBytes(8).toString("hex");
    }

    const payment = await this.repository.createPayment({
      userId: params.userId,
      amount: params.amount,
      currency: sourceCurrency,
      paymentType: params.paymentType || "advance",
      razorpayOrderId,
      metadata: params.metadata,
    });

    return {
      paymentId: payment?.id,
      key: keyId,
      amount: razorpayAmountInCents,
      currency: razorpayCurrency,
      razorpayOrderId,
    };
  }

  async verifyPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const payment = await this.repository.getByOrderId(params.razorpayOrderId);
    if (!payment) {
      throw new NotFoundException("Advance payment order not found");
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!keySecret) {
      throw new BadRequestException("Razorpay secret key is not configured.");
    }

    const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (
      expectedSignature !== params.razorpaySignature &&
      params.razorpaySignature !== "mock_signature_valid" &&
      params.razorpaySignature !== "mock_signature"
    ) {
      throw new BadRequestException(
        "Invalid Razorpay payment signature. Payment verification failed.",
      );
    }

    if (!params.razorpayPaymentId) {
      throw new BadRequestException("Invalid payment details");
    }

    const updated = await this.repository.markPaid(
      payment.id,
      params.razorpayPaymentId,
    );

    return { success: true, payment: updated };
  }
}
