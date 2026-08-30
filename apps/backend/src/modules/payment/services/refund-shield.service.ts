import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import axios from "axios";

export interface RefundShieldProduct {
  product_type: "TKT" | "HTL" | "PKG";
  title: string;
  price: number;
}

export interface RefundShieldParams {
  // Booking details
  bookingReference: string; // Your internal booking/inquiry ID
  bookingName: string; // e.g. "Flight KHI → LHR"

  // Customer details
  customerId: string; // cid — your internal user ID or email
  customerFirstName: string; // cname
  customerLastName: string; // csurname

  // Financial details (all in USD, which is what usdLedger provides)
  basketTotal: number; // Full basket total EXCLUDING refund shield fee itself
  passengerCount: number; // booking_quantity — number of tickets/pax

  // Booking metadata
  currency: string; // 'USD'
  departureDate: string; // ISO 8601 — start_date_of_event
  purchaseDate?: string; // ISO 8601 — date_of_purchase (defaults to now)

  // Whether user opted in — determines booking_is_refundable
  opted: boolean;

  // Per-passenger products for partial refund support (optional but recommended)
  products?: RefundShieldProduct[];
}

@Injectable()
export class RefundShieldService {
  private readonly logger = new Logger(RefundShieldService.name);

  constructor(private readonly dataSource: DataSource) {}

  private get apiUrl() {
    return (
      process.env.REFUND_SHIELD_API_URL ||
      "https://refund-shield-sandbox-fae8a5117ef1.herokuapp.com/api/booking/"
    );
  }

  private get apiKey() {
    return (
      process.env.REFUND_SHIELD_API_KEY || "0274324dd1685193a00ad30342a326d8"
    );
  }

  /**
   * Report a sale to Refund Shield.
   *
   * IMPORTANT: Call this AFTER payment.status === 'SUCCESS' for opted-in bookings.
   *
   * Per Tego Group spec:
   * - apikey goes in the JSON body, not headers
   * - booking_is_refundable = opted (true/false)
   * - booking_payment_value = basket total (excl. RS fee)
   * - booking_total_transaction_value = basket total + RS fee
   * - Fee = 10% of basket total
   * - Timeout: 10 seconds
   * - Treat as non-fatal background task
   */
  async reportSale(
    params: RefundShieldParams,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const refundShieldFee = params.opted
        ? Math.round(params.basketTotal * 0.1 * 100) / 100
        : 0;
      const totalTransactionValue = params.basketTotal + refundShieldFee;
      const purchaseDate = params.purchaseDate || new Date().toISOString();

      // Build products array — split basket proportionally if no explicit products given
      const products: RefundShieldProduct[] = params.products?.length
        ? params.products
        : Array.from({ length: params.passengerCount }, (_, i) => ({
            product_type: "TKT" as const,
            title: i === 0 ? "Adult Ticket" : `Passenger ${i + 1} Ticket`,
            price:
              Math.round((params.basketTotal / params.passengerCount) * 100) /
              100,
          }));

      const requestBody = {
        // Authentication — goes in body per Tego Group spec
        apikey: this.apiKey,

        // Customer
        cid: params.customerId,
        cname: params.customerFirstName,
        csurname: params.customerLastName,

        // Booking status
        booking_paid_in_full: params.opted, // true if payment collected in full
        booking_is_refundable: params.opted, // true = user opted in for RS

        // Financial
        booking_payment_value: params.basketTotal, // full basket value (excl. RS fee)
        booking_quantity: params.passengerCount, // number of tickets
        booking_total_transaction_value: totalTransactionValue, // basket + RS fee

        // Booking metadata
        booking_type: "TKT", // TKT = ticket (flight)
        booking_name: params.bookingName,
        booking_reference: params.bookingReference,

        // Currency & locale
        currency_code: params.currency || "USD",
        language_code: "EN",

        // Dates (ISO 8601)
        date_of_purchase: purchaseDate,
        start_date_of_event: params.departureDate || purchaseDate,

        // Per-product breakdown for partial refund support
        products,
      };

      // ── Local Database persistence is now handled universally in ExternalFlightProvider.saveBookingToMySQL ──

      this.logger.log(
        `[RefundShield] Reporting sale — ref: ${params.bookingReference}, opted: ${params.opted}, basketTotal: ${params.basketTotal}`,
      );

      await axios.post(this.apiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
          // Note: Origin header may be required by the sandbox (per cURL example in docs)
          Origin: process.env.APP_URL || "https://ezeeflights.com",
        },
        timeout: 10_000, // 10 second timeout per Tego Group spec
      });

      this.logger.log(
        `[RefundShield] ✅ Reported successfully — ref: ${params.bookingReference}`,
      );
      return { success: true };
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = JSON.stringify(err?.response?.data || err?.message);

      this.logger.error(
        `[RefundShield] ❌ Failed — ref: ${params.bookingReference}, status: ${status}, detail: ${detail}`,
      );

      // Non-fatal — the booking is already confirmed, RS failure must not break UX
      // Log the failure so you can retry via the retry mechanism described in the spec
      return { success: false, error: detail };
    }
  }

  async logToRefundShieldTable(params: {
    bookingRef: string;
    refundStatus: string;
    refundPrice: number;
    adultCount: number;
    childCount: number;
    infantCount: number;
    adultPrice?: number;
    childPrice?: number;
    infantPrice?: number;
    grandTotal: number;
  }) {
    try {
      let bookingRef = params.bookingRef;
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          bookingRef,
        ) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          bookingRef,
        );

      if (isUuid) {
        try {
          const rows = await this.dataSource.query(
            `SELECT bookingRef FROM tbl_customerdetails ORDER BY id DESC LIMIT 1`,
          );
          if (rows && rows.length > 0) {
            bookingRef = rows[0].bookingRef;
            this.logger.log(
              `[RefundShield] Resolved UUID ${params.bookingRef} to PNR ${bookingRef}`,
            );
          }
        } catch (err: any) {
          this.logger.error(
            `[RefundShield] Failed to resolve PNR from UUID: ${err.message}`,
          );
        }
      }

      // Check if a record with this bookingRef already exists in the refund_shield table
      const existing = await this.dataSource.query(
        `SELECT id FROM refund_shield WHERE booking_ref = ?`,
        [bookingRef],
      );

      if (existing && existing.length > 0) {
        // Update the existing record to avoid duplicate rows
        await this.dataSource.query(
          `UPDATE refund_shield SET
            refund_status = ?,
            refund_price = ?,
            trust_status = ?,
            trust_price = ?,
            adult_count = ?,
            child_count = ?,
            infant_count = ?,
            adult_price = ?,
            child_price = ?,
            infant_price = ?,
            grand_tota = ?,
            updated_at = NOW()
           WHERE booking_ref = ?`,
          [
            params.refundStatus,
            params.refundPrice,
            "NO",
            19.89,
            params.adultCount,
            params.childCount,
            params.infantCount,
            params.adultPrice ?? null,
            params.childPrice ?? null,
            params.infantPrice ?? null,
            params.grandTotal,
            bookingRef,
          ],
        );
        this.logger.log(
          `[RefundShield] Updated log in refund_shield table for ${bookingRef}`,
        );
      } else {
        // Insert a new record if it does not exist
        await this.dataSource.query(
          `INSERT INTO refund_shield (
            booking_ref, refund_status, refund_price,
            trust_status, trust_price,
            adult_count, child_count, infant_count,
            adult_price, child_price, infant_price,
            grand_tota
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingRef,
            params.refundStatus,
            params.refundPrice,
            "NO",
            19.89,
            params.adultCount,
            params.childCount,
            params.infantCount,
            params.adultPrice ?? null,
            params.childPrice ?? null,
            params.infantPrice ?? null,
            params.grandTotal,
          ],
        );
        const dbHost = process.env.MYSQL_SERVER || "127.0.0.1";
        const isLocal = dbHost === "127.0.0.1" || dbHost === "localhost";
        this.logger.log(
          `[RefundShield] Inserted log to refund_shield table (${isLocal ? "LOCAL" : "LIVE"}) for ${bookingRef}`,
        );
      }
      return { success: true };
    } catch (err: any) {
      this.logger.error(
        `[RefundShield] Failed to insert/update log to refund_shield table: ${err.message}`,
      );
      return { success: false, error: err.message };
    }
  }
}
