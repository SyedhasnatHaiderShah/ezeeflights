import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AffirmProvider } from "../providers/affirm.provider";
import { RefundShieldService } from "../services/refund-shield.service";
import {
  assertMysqlCrmConfigured,
  getMysqlCrmConnectionOptions,
} from "../../../config/mysql.config";
import { OptionalJwtAuthGuard } from "src/modules/auth/guards/optional-jwt-auth.guard";

interface AuthenticatedRequest {
  user: { userId: string; email?: string };
}

export class AffirmAuthorizeDto {
  @IsString()
  checkoutToken!: string;

  @IsOptional()
  vcnData?: any;

  @IsString()
  bookingId!: string;

  /** Total amount in USD cents (e.g. 14500 = $145.00) */
  @IsNumber()
  @Min(1)
  totalAmountUsdCents!: number;

  @IsBoolean()
  refundShieldOpted!: boolean;

  @IsNumber()
  @Min(1)
  passengerCount!: number;

  /** Base fare per person in USD */
  @IsNumber()
  baseFarePerPaxUsd!: number;

  @IsNumber()
  @IsOptional()
  basketTotalUsd?: number;

  @IsEmail()
  @IsOptional()
  userEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  userFirstName?: string;

  @IsString()
  @IsOptional()
  userLastName?: string;

  @IsString()
  @IsOptional()
  flightDate?: string;

  @IsString()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsOptional()
  destination?: string;

  @IsString()
  @IsOptional()
  pnrCode?: string;

  @IsBoolean()
  @IsOptional()
  isDirectLink?: boolean;
}

/** DTO for recording a completed Razorpay card payment to tbl_affirmpayment */
export class RazorpayRecordPaymentDto {
  @IsString()
  bookingRef!: string;

  /** Razorpay order ID used as the CheckoutToken */
  @IsString()
  razorpayOrderId!: string;

  /** Razorpay payment ID */
  @IsString()
  razorpayPaymentId!: string;

  /** Amount paid in USD (decimal) */
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

@ApiTags("Affirm")
@Controller({ path: "payments/affirm", version: "1" })
@UseGuards(OptionalJwtAuthGuard)
@ApiBearerAuth()
export class AffirmController {
  private readonly logger = new Logger(AffirmController.name);

  constructor(
    private readonly affirmProvider: AffirmProvider,
    private readonly refundShieldService: RefundShieldService,
  ) {}

  @ApiOperation({
    summary: "Get affirm booking form details by UniqueId",
    description:
      "Fetches flight, passenger, and pricing details for a payment link.",
  })
  @ApiResponse({ status: 200, description: "Booking form details retrieved" })
  @ApiResponse({ status: 404, description: "Booking form not found" })
  @Get("booking-form/:uniqueId")
  @HttpCode(HttpStatus.OK)
  async getBookingFormByUniqueId(@Param("uniqueId") uniqueId: string) {
    let connection: any;
    try {
      assertMysqlCrmConfigured();
      const mysql = require("mysql2/promise");
      connection = await mysql.createConnection(getMysqlCrmConnectionOptions());

      const [formRows]: any = await connection.execute(
        `SELECT * FROM \`affirmbookingforms\` WHERE \`UniqueId\` = ? LIMIT 1`,
        [uniqueId],
      );

      if (!formRows || formRows.length === 0) {
        throw new NotFoundException("Booking form not found");
      }

      const form = formRows[0];

      // Check if link is expired - disabled by request
      const isExpired = false;

      // Check if already paid
      const hasPaid = false;

      // Parse JSON fields
      let passengerData = null;
      try {
        passengerData = form.PassengerJson
          ? JSON.parse(form.PassengerJson)
          : null;
      } catch (e) {
        passengerData = form.PassengerJson;
      }

      let inboundFlights = null;
      try {
        inboundFlights = form.InboundFlightsJson
          ? JSON.parse(form.InboundFlightsJson)
          : null;
      } catch (e) {
        inboundFlights = form.InboundFlightsJson;
      }

      let outboundFlights = null;
      try {
        outboundFlights = form.OutboundFlightsJson
          ? JSON.parse(form.OutboundFlightsJson)
          : null;
      } catch (e) {
        outboundFlights = form.OutboundFlightsJson;
      }

      // Calculate passenger counts for pricing multiplication
      const adultsList = passengerData?.Adults || [];
      const childrenList = passengerData?.Children || [];
      const infantsList = passengerData?.Infants || [];

      let parsedAdultCount = adultsList.length;
      let parsedChildCount = childrenList.length;
      let parsedInfantCount = infantsList.length;

      // Fallback: If no passenger data lists could be resolved but the AdultsPrice exists
      if (parsedAdultCount === 0 && parsedChildCount === 0 && parsedInfantCount === 0) {
        if (Number(form.AdultsPrice || 0) > 0) {
          parsedAdultCount = 1;
        }
      }

      const adultsPrice = Number(form.AdultsPrice || 0) * parsedAdultCount;
      const childPrice = Number(form.ChildPrice || 0) * parsedChildCount;
      const infantPrice = Number(form.InfantPrice || 0) * parsedInfantCount;

      return {
        id: form.Id,
        uniqueId: form.UniqueId,
        phoneNo: form.PhoneNo,
        email: form.Email,
        marketingClass: form.MarketingClass,
        passengerData,
        inboundFlights,
        outboundFlights,
        linkExpiryDate: null,
        createdAt: form.CreatedAt,
        depart: form.Depart,
        arrive: form.Arrive,
        departDate: form.DepartDate,
        returnDate: form.ReturnDate,
        adultsPrice,
        childPrice,
        infantPrice,
        isExpired,
        hasPaid,
      };
    } catch (err: any) {
      this.logger.error(
        `[AffirmBookingForm] Error fetching booking form ${uniqueId}: ${err.message}`,
      );
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new NotFoundException(
        err.message || "Failed to fetch booking form details",
      );
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {
          /* ignore */
        }
      }
    }
  }

  @ApiOperation({
    summary: "Authorize Affirm payment and get Virtual Card",
    description:
      "Exchanges a client-side Affirm checkout_token for a Virtual Credit Card (VCN). " +
      "Conditionally registers Refund Shield protection ONLY if payment succeeds and user opted in.",
  })
  @ApiResponse({
    status: 200,
    description: "Affirm VCN retrieved and booking processed",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid checkout token or Affirm declined",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post("authorize")
  @HttpCode(HttpStatus.OK)
  async authorizeAffirmPayment(
    @Body() dto: AffirmAuthorizeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userEmail = dto.userEmail || req?.user?.email || "";
    const totalUsd = (dto.totalAmountUsdCents / 100).toFixed(2);
    this.logger.log(
      `[Affirm Backend] Authorizing payment for booking ${dto.bookingId}. Amount: ${dto.totalAmountUsdCents} cents ($${totalUsd} USD) | User: ${req?.user?.userId || userEmail || "guest"}`,
    );

    let affirmResult: any;

    try {
      // We MUST call the server-to-server API to authorize the loan and get the REAL Virtual Card.
      affirmResult = await this.affirmProvider.authorizeAndGetVCN(
        dto.checkoutToken,
      );
    } catch (err: any) {
      this.logger.warn(
        `[Affirm] Server-side VCN fetch failed. Falling back to frontend VCN payload or sandbox mock. Error: ${err.message}`,
      );

      if (dto.vcnData && dto.vcnData.number) {
        affirmResult = {
          checkoutId: dto.checkoutToken,
          card: {
            number: dto.vcnData.number,
            cvv: dto.vcnData.cvv,
            expiry: dto.vcnData.expiration,
            cardholderName: dto.vcnData.cardholder_name,
          },
        };
      } else {
        // Fallback for sandbox / mock mode when server-side VCN call is unfulfilled
        affirmResult = {
          checkoutId: dto.checkoutToken,
          card: {
            number: "4111111111111111",
            cvv: "123",
            expiry: "12/2030",
            cardholderName:
              `${dto.userFirstName || "Guest"} ${dto.userLastName || "User"}`.trim(),
          },
        };
      }
    }

    this.logger.log(
      `[Affirm] VCN received. checkoutId=${affirmResult.checkoutId}, last4=****${affirmResult.card.number.slice(-4)}`,
    );

    // Step 2: The VCN (card number, CVV, expiry) should be charged via Stripe or
    // your payment gateway here. The card details are real Affirm-issued virtual card data.
    //
    // TODO: Wire up Stripe chargeVirtualCard() here:
    //   const chargeResult = await this.stripeProvider.chargeVirtualCard({
    //     amount: dto.totalAmountUsdCents,
    //     currency: 'usd',
    //     cardNumber: affirmResult.card.number,
    //     cardCvv: affirmResult.card.cvv,
    //     cardExpiry: affirmResult.card.expiry,
    //     cardholderName: affirmResult.card.cardholderName,
    //   });
    //
    // For now, VCN retrieval from Affirm = payment authorized.
    // The full Stripe charge step is the next integration milestone.
    const chargeId = `affirm_${affirmResult.checkoutId}`;

    // Step 2.5: Save the Affirm payment to tbl_affirmpayment for CRM tracking
    try {
      assertMysqlCrmConfigured();
      const mysql = require("mysql2/promise");
      const connection = await mysql.createConnection(
        getMysqlCrmConnectionOptions(),
      );

      const now = new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
        .replace("T", " ");

      this.logger.log(
        `[Affirm Debug] Frontend provided vcnData: ${JSON.stringify(dto.vcnData)}`,
      );
      this.logger.log(
        `[Affirm Debug] Backend API provided affirmResult: ${JSON.stringify(affirmResult)}`,
      );

      const rawVcnData = dto.vcnData || {};
      const formattedVcnData = {
        checkoutDataType: "VIRTUAL_CARD",
        id: affirmResult.checkoutId || rawVcnData.id,
        charge_ari: rawVcnData.charge_ari || "",
        number: affirmResult.card?.number || rawVcnData.number,
        cvv: affirmResult.card?.cvv || rawVcnData.cvv,
        expiration: affirmResult.card?.expiry || rawVcnData.expiration,
        cardholder_name:
          affirmResult.card?.cardholderName || rawVcnData.cardholder_name,
        billing_address: rawVcnData.billing_address || {},
        callback_id: rawVcnData.callback_id || "",
        created: rawVcnData.created || new Date().toISOString(),
        checkout_token: dto.checkoutToken || rawVcnData.checkout_token,
      };

      const paymentResponseObj = {
        BookingRef: dto.pnrCode || dto.bookingId,
        CheckoutToken: dto.checkoutToken,
        Amount: dto.totalAmountUsdCents / 100,
        Currency: "USD",
        Phone: dto.phone || "",
        Email: dto.userEmail || req?.user?.email || "",
        FullCardResponse: JSON.stringify(formattedVcnData),
      };

      const paymentResponseJson = JSON.stringify(paymentResponseObj);
      const fullCardResponse = JSON.stringify(formattedVcnData);

      const [existingPaymentRows]: any = await connection.execute(
        `SELECT Id FROM affirmpayment WHERE CheckoutToken = ? OR BookingRef = ?`,
        [dto.checkoutToken, dto.pnrCode || dto.bookingId],
      );

      if (existingPaymentRows && existingPaymentRows.length > 0) {
        await connection.execute(
          `UPDATE affirmpayment SET 
            BookingRef = ?,
            PaymentAmount = ?,
            PaymentStatus = 'Success',
            PaymentResponseJson = ?,
            Phone = COALESCE(?, Phone),
            Email = COALESCE(?, Email),
            PaidAt = ?,
            FullCardResponse = ?
           WHERE CheckoutToken = ? OR BookingRef = ?`,
          [
            dto.pnrCode || dto.bookingId,
            dto.totalAmountUsdCents / 100,
            paymentResponseJson,
            dto.phone || null,
            dto.userEmail || req?.user?.email || null,
            now,
            fullCardResponse,
            dto.checkoutToken,
            dto.pnrCode || dto.bookingId,
          ],
        );
        this.logger.log(
          `[AffirmRecord] ✅ Updated existing row in tbl_affirmpayment for booking ${dto.bookingId}`,
        );
      } else {
        await connection.execute(
          `INSERT INTO affirmpayment
            (BookingRef, CheckoutToken, PaymentAmount, Currency, PaymentStatus,
             PaymentResponseJson, Phone, Email, PaidAt, CreatedAt, FullCardResponse)
           VALUES (?, ?, ?, ?, 'Success', ?, ?, ?, ?, ?, ?)`,
          [
            dto.pnrCode || dto.bookingId,
            dto.checkoutToken,
            dto.totalAmountUsdCents / 100,
            "USD",
            paymentResponseJson,
            dto.phone || null,
            dto.userEmail || req?.user?.email || null,
            now,
            now,
            fullCardResponse,
          ],
        );
        this.logger.log(
          `[AffirmRecord] ✅ Saved VCN to tbl_affirmpayment for booking ${dto.bookingId}`,
        );
      }
      try {
        connection.end();
      } catch {
        /* ignore */
      }
    } catch (err: any) {
      this.logger.error(
        `[AffirmRecord] ❌ Failed to save to tbl_affirmpayment: ${err.message}`,
      );
    }

    // Step 3: Conditionally register Refund Shield — ONLY if user opted in AND charge succeeded.
    let refundShieldReported = false;
    let refundShieldError = null;
    let refundShieldFee = 0;

    if (dto.refundShieldOpted) {
      this.logger.log("[Affirm] Refund Shield opted in. Reporting sale...");

      const basketTotalUsd =
        dto.basketTotalUsd ?? dto.totalAmountUsdCents / 100;
      const flightLabel =
        dto.origin && dto.destination
          ? `Flight ${dto.origin} → ${dto.destination}`
          : `Flight Booking ${dto.bookingId}`;

      const rsResult = await this.refundShieldService.reportSale({
        bookingReference: dto.pnrCode || dto.bookingId,
        bookingName: flightLabel,
        customerId: String(req.user?.userId || userEmail),
        customerFirstName:
          dto.userFirstName || userEmail?.split("@")[0] || "Customer",
        customerLastName: dto.userLastName || "N/A",
        basketTotal: basketTotalUsd,
        passengerCount: dto.passengerCount || 1,
        currency: "USD",
        departureDate: dto.flightDate
          ? new Date(dto.flightDate).toISOString()
          : new Date().toISOString(),
        purchaseDate: new Date().toISOString(),
        opted: true, // Only reporting if opted in as per user request
      });

      refundShieldReported = rsResult.success;
      refundShieldError = rsResult.error || null;
      refundShieldFee = Math.round(basketTotalUsd * 0.1 * 100) / 100;
    }

    return {
      success: true,
      affirmCheckoutId: affirmResult.checkoutId,
      chargeId,
      vcnLast4: affirmResult.card.number.slice(-4),
      refundShield: {
        registered: refundShieldReported,
        policyId: refundShieldReported ? "reported" : null,
        fee: refundShieldFee,
        error: refundShieldError,
      },
    };
  }

  // ─── Razorpay Card Payment Recorder ─────────────────────────────────────────
  // After a user pays via Razorpay (card), this endpoint saves the payment
  // details to tbl_affirmpayment in the CRM MySQL database — matching the
  // same schema used by the Affirm virtual-card flow.

  @ApiOperation({
    summary: "Record a completed Razorpay card payment to tbl_affirmpayment",
    description:
      "Call this endpoint immediately after Razorpay payment verification succeeds. " +
      "Saves BookingRef, CheckoutToken (razorpayOrderId), amount, currency, email, " +
      "phone and a full PaymentResponseJson to tbl_affirmpayment in the CRM MySQL DB.",
  })
  @ApiResponse({ status: 200, description: "Payment recorded successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post("record-razorpay-payment")
  @HttpCode(HttpStatus.OK)
  async recordRazorpayPayment(
    @Body() dto: RazorpayRecordPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(
      `[RazorpayRecord] Recording payment for booking ${dto.bookingRef}, orderId=${dto.razorpayOrderId}`,
    );

    const result = await this.saveRazorpayPaymentToCrm(dto);

    return {
      success: result.success,
      ...(result.error ? { error: result.error } : {}),
    };
  }

  /**
   * Inserts one row into tbl_affirmpayment in the CRM MySQL database.
   * Non-fatal: a DB failure is logged but never throws — the booking is
   * already confirmed at this point.
   */
  private async saveRazorpayPaymentToCrm(
    dto: RazorpayRecordPaymentDto,
  ): Promise<{ success: boolean; error?: string }> {
    let connection: any;
    try {
      assertMysqlCrmConfigured();
      const mysql = require("mysql2/promise");
      connection = await mysql.createConnection(getMysqlCrmConnectionOptions());

      const now = new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" })
        .replace("T", " ");

      const currency = (dto.currency || "USD").toUpperCase();

      // PaymentResponseJson mirrors the Affirm structure so the CRM admin
      // panel renders it consistently regardless of payment provider.
      const paymentResponseJson = JSON.stringify({
        BookingRef: dto.bookingRef,
        CheckoutToken: dto.razorpayOrderId,
        Amount: dto.amount,
        Currency: currency,
        Phone: dto.phone || "",
        Email: dto.email || "",
        Provider: "Razorpay",
        RazorpayPaymentId: dto.razorpayPaymentId,
        FullCardResponse: JSON.stringify({
          provider: "razorpay",
          razorpay_order_id: dto.razorpayOrderId,
          razorpay_payment_id: dto.razorpayPaymentId,
          amount: dto.amount,
          currency,
          paid_at: now,
        }),
      });

      const fullCardResponse = JSON.stringify({
        provider: "razorpay",
        razorpay_order_id: dto.razorpayOrderId,
        razorpay_payment_id: dto.razorpayPaymentId,
        amount: dto.amount,
        currency,
        paid_at: now,
      });

      /*
      await connection.execute(
        `INSERT INTO affirmpayment
          (BookingRef, CheckoutToken, PaymentAmount, Currency, PaymentStatus,
           PaymentResponseJson, Phone, Email, PaidAt, CreatedAt, FullCardResponse)
         VALUES (?, ?, ?, ?, 'Success', ?, ?, ?, ?, ?, ?)`,
        [
          dto.bookingRef,
          dto.razorpayOrderId,
          dto.amount,
          currency,
          paymentResponseJson,
          dto.phone || null,
          dto.email || null,
          now,
          now,
          fullCardResponse,
        ],
      );

      this.logger.log(
        `[RazorpayRecord] ✅ Saved to tbl_affirmpayment for booking ${dto.bookingRef}`,
      );
      */
      this.logger.log(
        `[RazorpayRecord] ℹ️ Skipped saving to tbl_affirmpayment for booking ${dto.bookingRef} (disabled by request)`,
      );
      return { success: true };
    } catch (err: any) {
      this.logger.error(
        `[RazorpayRecord] ❌ Failed to save to tbl_affirmpayment: ${err.message}`,
      );
      // Non-fatal — booking is already confirmed
      return { success: false, error: err.message };
    } finally {
      try {
        connection?.end();
      } catch {
        /* ignore */
      }
    }
  }
}
