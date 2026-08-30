# Affirm BNPL + Refund Shield Integration Plan

**Project:** EzeeFlights (NestJS Backend + Next.js Frontend Monorepo)
**Status:** Ready for Implementation
**Refund Shield Spec:** Tego Group Integration Guide v1.2

---

## Overview

This plan integrates two features into the EzeeFlights booking checkout:

1. **Affirm VCN (Virtual Card Network)** — A Buy Now, Pay Later gateway that issues a Virtual Credit Card upon approval, charged through your existing payment rail.

2. **Refund Shield** — An optional travel protection add-on powered by Tego Group. The fee is **10% of the total basket spend (base fare + tax + all fees combined)** per booking. The Refund Shield API **must only be called after payment is fully confirmed AND the user explicitly opted in (`refundShieldOpted === true`)**. When the user declines, the API must still be called with `booking_is_refundable: false` to track conversion rates.

---

## Critical: Refund Shield API — What Was Wrong Before

The original `refund-shield.service.ts` used a **guessed** request body. The actual Tego Group API (confirmed from the official PDF) requires completely different fields. Key corrections:

| Wrong (old guess)             | Correct (from PDF spec)                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `x-api-key` header            | `apikey` field **inside the JSON body**                                               |
| `booking_reference` only      | Full booking fields: `cid`, `cname`, `csurname`, `booking_type`, `booking_name`, etc. |
| `passenger_count` field       | `booking_quantity` (number of tickets)                                                |
| `protection_fee` field        | Not a field — fee is calculated on your side, not sent                                |
| `policy_id` in response       | No policy_id returned — success = 2xx response                                        |
| `email` field                 | `cid` (customer ID), `cname`, `csurname`                                              |
| Only called on opted-in       | Also call with `booking_is_refundable: false` when declined                           |
| `10% of base fare per person` | `10% of the TOTAL basket` (base + tax + seats + ancillaries + addons)                 |

---

## Phase 1: Environment Variables

### `.env` (root or backend)

```env
# ── Affirm ────────────────────────────────────────────────────────
AFFIRM_PUBLIC_KEY=WCE4XYM8ENAIT5LN
AFFIRM_PRIVATE_KEY=your_affirm_private_key      # Get from Affirm merchant dashboard
AFFIRM_API_URL=https://sandbox.affirm.com        # Sandbox
# AFFIRM_API_URL=https://api.affirm.com          # Production
AFFIRM_ENVIRONMENT=sandbox
AFFIRM_LOCALE=en_US
AFFIRM_COUNTRY_CODE=USA

# ── Refund Shield (Tego Group) ────────────────────────────────────
REFUND_SHIELD_API_URL=https://refund-shield-sandbox-fae8a5117ef1.herokuapp.com/api/booking/
REFUND_SHIELD_API_KEY=0274324dd1685193a00ad30342a326d8
# Production (requires separate key from account manager):
# REFUND_SHIELD_API_URL=https://refund-shield-production-5cabd1e1c778.herokuapp.com/api/booking/
# REFUND_SHIELD_API_KEY=your_production_key

# ── Frontend (Next.js) ────────────────────────────────────────────
NEXT_PUBLIC_AFFIRM_PUBLIC_KEY=WCE4XYM8ENAIT5LN
NEXT_PUBLIC_AFFIRM_SCRIPT_URL=https://cdn1-sandbox.affirm.com/js/v2/affirm.js
# Production: https://cdn1.affirm.com/js/v2/affirm.js
```

---

## Phase 2: Database Schema Changes

### New columns on `payments` table

```sql
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS affirm_checkout_id       TEXT,
  ADD COLUMN IF NOT EXISTS vcn_last4                VARCHAR(4),
  ADD COLUMN IF NOT EXISTS vcn_expiry               VARCHAR(7),   -- MM/YYYY
  ADD COLUMN IF NOT EXISTS vcn_charge_id            TEXT,         -- Stripe charge ID from VCN
  ADD COLUMN IF NOT EXISTS refund_shield_opted      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_shield_reported   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_shield_error      TEXT;         -- store error if RS call fails
```

> **Never store the full VCN card number or CVV in the database.** Only store `last4` and `expiry` for auditing. Raw VCN details must only exist in memory during the charge operation.

---

## Phase 3: Backend — NestJS Implementation

### 3.1 New File: `affirm.provider.ts`

**Path:** `apps/backend/src/modules/payment/providers/affirm.provider.ts`

```typescript
import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class AffirmProvider {
  readonly provider = "affirm";

  private get apiUrl() {
    return process.env.AFFIRM_API_URL || "https://sandbox.affirm.com";
  }

  private get auth() {
    return {
      username: process.env.AFFIRM_PUBLIC_KEY!,
      password: process.env.AFFIRM_PRIVATE_KEY!,
    };
  }

  /**
   * Exchange a client-side checkout_token for a virtual card.
   */
  async authorizeAndGetVCN(checkoutToken: string): Promise<{
    checkoutId: string;
    card: {
      number: string;
      cvv: string;
      expiry: string;
      cardholderName: string;
    };
  }> {
    // Step 1: Authorize (charge) the loan using the checkout token
    const chargeRes = await axios.post(
      `${this.apiUrl}/api/v2/charges`,
      { checkout_token: checkoutToken },
      { auth: this.auth },
    );

    const checkoutId: string = chargeRes.data.id;

    // Step 2: Read the Virtual Card details from the charge
    const cardRes = await axios.get(
      `${this.apiUrl}/api/v2/charges/${checkoutId}/card`,
      { auth: this.auth },
    );

    const { number, cvv, expiration, cardholder_name } = cardRes.data;

    return {
      checkoutId,
      card: {
        number,
        cvv,
        expiry: expiration,
        cardholderName: cardholder_name,
      },
    };
  }

  /**
   * Void/refund an Affirm loan if the charge needs to be reversed.
   */
  async voidCharge(checkoutId: string): Promise<void> {
    await axios.post(
      `${this.apiUrl}/api/v2/charges/${checkoutId}/void`,
      {},
      { auth: this.auth },
    );
  }
}
```

---

### 3.2 CORRECTED File: `refund-shield.service.ts`

**Path:** `apps/backend/src/modules/payment/services/refund-shield.service.ts`

This is the fully corrected version based on the official Tego Group API spec. The key differences from the old version:

- `apikey` goes **inside the JSON body**, not in a header
- Correct field names: `cid`, `cname`, `csurname`, `booking_paid_in_full`, `booking_is_refundable`, `booking_payment_value`, `booking_quantity`, `booking_total_transaction_value`, `booking_type`, `booking_name`, `booking_reference`, `currency_code`, `language_code`, `date_of_purchase`, `start_date_of_event`, `products`
- The fee is **10% of the full basket total** (base + tax + seats + ancillaries + addons) — NOT base fare only, NOT per-person
- Must also be called with `booking_is_refundable: false` when user declines — pass `opted: false` to trigger this
- 10-second timeout as per spec
- Treat as a background/webhook-style call — never fail the booking over RS errors
- **Local Database Tracking**: Local persistence (`refund_shield` and `refundshieldbookingscnfrm`) is decoupled from this API call and is handled universally inside `ExternalFlightProvider.saveBookingToMySQL` to guarantee persistence across all confirmation flows.

```typescript
import { Injectable, Logger } from "@nestjs/common";
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
   * Report a sale (or decline) to Refund Shield.
   *
   * IMPORTANT: Call this AFTER payment.status === 'SUCCESS' for opted-in bookings.
   * Also call with opted=false when the user declines, to track conversion.
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
}
```

---

### 3.3 New File: `affirm.controller.ts`

**Path:** `apps/backend/src/modules/payment/controllers/affirm.controller.ts`

This endpoint is called **after** Razorpay payment verification succeeds (the frontend's `handleAffirmCheckout` already does Razorpay → `confirmBookingAfterPayment` first, then calls this endpoint).

```typescript
import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  Logger,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { AffirmProvider } from "../providers/affirm.provider";
import { RefundShieldService } from "../services/refund-shield.service";

export class AffirmAuthorizeDto {
  checkoutToken: string;
  bookingId: string;
  totalAmountUsdCents: number; // Grand total in USD cents (after conversion)

  // Refund Shield fields
  refundShieldOpted: boolean;
  passengerCount: number;
  // Basket total in USD (BEFORE RS fee) — used for RS reporting
  // = totalAmountUsdCents/100 minus affirmFee if any, frontend should pass pre-RS total
  basketTotalUsd?: number;

  // Booking metadata for RS
  userEmail: string;
  userFirstName?: string;
  userLastName?: string;
  origin?: string;
  destination?: string;
  flightDate?: string; // ISO 8601 departure date
  pnrCode?: string;
}

@Controller("v1/payments/affirm")
@UseGuards(JwtAuthGuard)
export class AffirmController {
  private readonly logger = new Logger(AffirmController.name);

  constructor(
    private readonly affirmProvider: AffirmProvider,
    private readonly refundShieldService: RefundShieldService,
  ) {}

  /**
   * Called by frontend AFTER Razorpay payment is verified and booking inquiry is created.
   * Responsible for:
   * 1. Authorizing the Affirm token (getting VCN) — for record-keeping/future use
   * 2. Reporting the sale (or decline) to Refund Shield
   *
   * GATE: Refund Shield is ONLY reported as refundable when:
   *   - refundShieldOpted === true  AND
   *   - This endpoint is reached (meaning payment already succeeded upstream)
   */
  @Post("authorize")
  async authorizeAndReport(
    @Body() dto: AffirmAuthorizeDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || dto.userEmail;

    // ── Step 1: Exchange Affirm token (optional — for VCN record-keeping) ──
    let affirmCheckoutId: string | null = null;
    try {
      const { checkoutId } = await this.affirmProvider.authorizeAndGetVCN(
        dto.checkoutToken,
      );
      affirmCheckoutId = checkoutId;
      this.logger.log(`[Affirm] VCN authorized — checkoutId: ${checkoutId}`);
    } catch (affirmErr: any) {
      // Sandbox note: VCN endpoint may not return real cards in sandbox.
      // Log but don't fail — payment was already captured via Razorpay.
      this.logger.warn(
        `[Affirm] VCN authorization skipped/failed (sandbox): ${affirmErr.message}`,
      );
    }

    // ── Step 2: Report to Refund Shield ──
    // Gate: payment succeeded (we are past Razorpay verification), now check opted flag.
    // We ALWAYS call reportSale — opted=true for accepted, opted=false for declined.
    // This is per Tego Group spec: "submit with sold as false" when declined.
    const basketTotalUsd = dto.basketTotalUsd ?? dto.totalAmountUsdCents / 100;
    const flightLabel =
      dto.origin && dto.destination
        ? `Flight ${dto.origin} → ${dto.destination}`
        : `Flight Booking ${dto.bookingId}`;

    const rsResult = await this.refundShieldService.reportSale({
      bookingReference: dto.pnrCode || dto.bookingId,
      bookingName: flightLabel,
      customerId: String(userId || dto.userEmail),
      customerFirstName:
        dto.userFirstName || dto.userEmail?.split("@")[0] || "Customer",
      customerLastName: dto.userLastName || "N/A",
      basketTotal: basketTotalUsd,
      passengerCount: dto.passengerCount || 1,
      currency: "USD",
      departureDate: dto.flightDate
        ? new Date(dto.flightDate).toISOString()
        : new Date().toISOString(),
      purchaseDate: new Date().toISOString(),
      opted: dto.refundShieldOpted, // ← THE GATE: true only if user opted in
    });

    return {
      success: true,
      affirmCheckoutId,
      refundShieldReported: rsResult.success,
      refundShieldError: rsResult.error || null,
    };
  }
}
```

---

### 3.4 Update: `payment.module.ts`

```typescript
import { AffirmProvider } from './providers/affirm.provider';
import { AffirmController } from './controllers/affirm.controller';
import { RefundShieldService } from './services/refund-shield.service';

// In @Module decorator:
controllers: [...existingControllers, AffirmController],
providers: [...existingProviders, AffirmProvider, RefundShieldService],
exports: [...existingExports, AffirmProvider, RefundShieldService],
```

---

### 3.5 How to Also Report RS for Non-Affirm Bookings (Standard + Refund Shield)

The existing `handleRefundShieldCheckout` flow in `booking/page.tsx` goes through Razorpay but does **not** call the Affirm controller. You need a separate endpoint or call `RefundShieldService.reportSale()` from your existing inquiry/booking confirmation service.

**Option A — Add a dedicated RS endpoint (recommended):**

```typescript
// apps/backend/src/modules/payment/controllers/refund-shield.controller.ts
import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RefundShieldService } from "../services/refund-shield.service";

export class ReportRefundShieldDto {
  bookingId: string;
  pnrCode?: string;
  basketTotalUsd: number;
  passengerCount: number;
  opted: boolean; // must be true — gate enforced below
  userEmail: string;
  userFirstName?: string;
  userLastName?: string;
  origin?: string;
  destination?: string;
  flightDate?: string;
  paymentVerified: boolean; // frontend passes this after verifyAdvancePayment()
}

@Controller("v1/payments/refund-shield")
@UseGuards(JwtAuthGuard)
export class RefundShieldController {
  constructor(private readonly refundShieldService: RefundShieldService) {}

  @Post("report")
  async report(@Body() dto: ReportRefundShieldDto, @Request() req: any) {
    // GATE: Only report as refundable if BOTH conditions are true:
    //   1. payment was verified upstream (dto.paymentVerified === true)
    //   2. user explicitly opted in (dto.opted === true)
    const shouldBeRefundable =
      dto.paymentVerified === true && dto.opted === true;

    const result = await this.refundShieldService.reportSale({
      bookingReference: dto.pnrCode || dto.bookingId,
      bookingName:
        `Flight ${dto.origin || ""} → ${dto.destination || ""}`.trim() ||
        `Booking ${dto.bookingId}`,
      customerId: String(req.user?.id || dto.userEmail),
      customerFirstName: dto.userFirstName || "Customer",
      customerLastName: dto.userLastName || "N/A",
      basketTotal: dto.basketTotalUsd,
      passengerCount: dto.passengerCount || 1,
      currency: "USD",
      departureDate: dto.flightDate
        ? new Date(dto.flightDate).toISOString()
        : new Date().toISOString(),
      purchaseDate: new Date().toISOString(),
      opted: shouldBeRefundable,
    });

    return { success: true, reported: result.success };
  }
}
```

**Option B — Call from `confirmBookingAfterPayment` in the inquiry service:**

In your NestJS inquiry/booking service, after `status = 'confirmed'` is saved, fire `RefundShieldService.reportSale()` as a background task using `setImmediate` or a queue. Pass `opted` from `flightSnapshot.refundShieldOpted`.

---

## Phase 4: Frontend — Refund Shield API Call Flow

### Where RS Is Currently Triggered in `booking/page.tsx`

```
handleRefundShieldCheckout()  ← standard flow with RS opted
  → collectAdvanceRazorpayPayment()  [payment captured]
  → confirmBookingAfterPayment()     [booking created]
  ← MISSING: call backend to report to Tego Group RS API

handleAffirmCheckout()        ← affirm flow
  → openAffirmCheckout()             [Affirm modal]
  → collectAdvanceRazorpayPayment()  [payment captured]
  → confirmBookingAfterPayment()     [booking created]
  → apiFetch('/payments/affirm/authorize', ...)  ← RS reported here (already exists)
```

### Fix for `handleRefundShieldCheckout` — Add RS Reporting Call

After `confirmBookingAfterPayment` resolves, add the RS report call:

```typescript
async function handleRefundShieldCheckout() {
  if (!validateBeforeSubmit()) return;
  setSubmitLoading(true);
  setError("");
  try {
    const orderData = await collectAdvanceRazorpayPayment({
      amount: grandTotal,
      paymentType: "refund_shield",
      description: "Flight Booking with Refund Shield",
      metadata: { refundShieldOpted: true },
    });

    const result = await confirmBookingAfterPayment({
      advancePaymentVerified: true,
      paymentFlow: "refund_shield",
      refundShieldOpted: true,
      razorpayOrderId: orderData.razorpayOrderId,
    });

    // ── NEW: Report to Refund Shield API ──────────────────────────
    // GATE: only fires because refundShieldOpted===true AND payment succeeded above
    const bookingId = (result as any)?.id || urlFlightId || "unknown";
    await apiFetch("/payments/refund-shield/report", {
      method: "POST",
      body: JSON.stringify({
        bookingId,
        pnrCode: (result as any)?.pnrCode || bookingId,
        basketTotalUsd: usdLedger.total, // full basket in USD excl. RS fee
        passengerCount: totalPax,
        opted: true, // user opted in
        paymentVerified: true, // Razorpay verified above
        userEmail: contactEmail.trim() || session?.email || "",
        userFirstName: travelers[0]?.firstName || "",
        userLastName: travelers[0]?.lastName || "",
        origin: searchParams.get("org") || "",
        destination: searchParams.get("des") || "",
        flightDate: searchParams.get("dDate") || "",
      }),
    });
    // ─────────────────────────────────────────────────────────────
  } catch (e: any) {
    if (e.message !== "Payment cancelled by user") {
      setError(e.message || "Payment processing failed. Please try again.");
    }
  } finally {
    setSubmitLoading(false);
  }
}
```

### Update `handleAffirmCheckout` — Pass Basket Total for RS

The Affirm flow already calls `/payments/affirm/authorize`. Update the payload to include `basketTotalUsd` and name fields:

```typescript
await apiFetch("/payments/affirm/authorize", {
  method: "POST",
  body: JSON.stringify({
    checkoutToken,
    bookingId,
    totalAmountUsdCents: totalUsdCents,
    refundShieldOpted, // ← user's choice (true/false)
    passengerCount: totalPax,
    basketTotalUsd: usdLedger.total, // ← NEW: basket excl. RS fee
    userEmail: contactEmail.trim() || session?.email || "",
    userFirstName: travelers[0]?.firstName || "", // ← NEW
    userLastName: travelers[0]?.lastName || "", // ← NEW
    flightDate: searchParams.get("dDate") || "",
    origin: searchParams.get("org") || "",
    destination: searchParams.get("des") || "",
    pnrCode: (result as any)?.pnrCode || bookingId,
  }),
});
```

---

## Phase 5: Refund Shield Fee Calculation — Correction

**Current code (incorrect):**

```typescript
// booking/page.tsx — WRONG: only 10% of base fare
const refundShieldFee = baseFareValue * 0.1;
```

**Per Tego Group spec (correct):**

> "10% of the basket total — include everything the customer has paid for, including all fees and taxes. The only items to exclude are: Donations and the Refund Shield product fee itself."

**Correct calculation (already implemented correctly in `booking/page.tsx`):**

```typescript
// This is already correct in the file:
const refundShieldFee = useMemo(() => {
  if (!refundShieldOpted || isBid) return 0;
  const subtotal =
    baseFareValue + taxValue + seatTotal + ancillaryTotal + addonsTotal;
  return subtotal * 0.1; // ✅ 10% of full basket, excl. RS fee itself and Affirm fee
}, [
  refundShieldOpted,
  isBid,
  baseFareValue,
  taxValue,
  seatTotal,
  ancillaryTotal,
  addonsTotal,
]);
```

The `usdLedger.total` passed as `basketTotalUsd` to the backend should be the **pre-RS-fee** total in USD. Verify `computeUsdLedgerTotals` excludes the RS fee from the base `total` or pass `usdLedger.total - usdLedger.refundShieldFee` explicitly.

---

## Phase 6: Refund Shield — Decline Reporting

Per the Tego Group spec, you should also submit `booking_is_refundable: false` when the user declines. This happens in the standard (`handleSubmit`) flow.

Add a fire-and-forget call at the end of `confirmBookingAfterPayment` for non-opted bookings:

```typescript
async function confirmBookingAfterPayment(
  paymentMeta: Record<string, unknown>,
) {
  const result = await submitInquiry({
    ...buildInquiryPayload(paymentMeta),
    status: "pending",
  });
  setInquiryResult(result as any);
  setStep(2);

  // Report RS decline (non-fatal, fire-and-forget)
  if (!isBid) {
    const bookingId = (result as any)?.id || urlFlightId || "unknown";
    apiFetch("/payments/refund-shield/report", {
      method: "POST",
      body: JSON.stringify({
        bookingId,
        pnrCode: (result as any)?.pnrCode || bookingId,
        basketTotalUsd: usdLedger.total,
        passengerCount: totalPax,
        opted: refundShieldOpted, // false for decline, true for opted-in (standard flow)
        paymentVerified: !!paymentMeta.advancePaymentVerified,
        userEmail: contactEmail.trim() || session?.email || "",
        userFirstName: travelers[0]?.firstName || "",
        userLastName: travelers[0]?.lastName || "",
        origin: searchParams.get("org") || "",
        destination: searchParams.get("des") || "",
        flightDate: searchParams.get("dDate") || "",
      }),
    }).catch(() => {
      /* non-fatal */
    });
  }

  return result;
}
```

---

## Phase 7: `TripSummary.tsx` — UI Updates

### a) Corrected Refund Shield Description

Per the spec, the fee is 10% of the full basket (not just base fare):

```tsx
{
  /* Refund Shield Toggle */
}
<div className="flex items-center justify-between py-2 border-t border-border/30 mt-2">
  <div className="flex flex-col gap-0.5">
    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
      <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
      Travel Protection
    </span>
    <span className="text-[10px] text-muted-foreground">
      Refund Shield — 10% of total basket
    </span>
    {/* Link to Refundable Terms — required by Tego Group spec */}
    <a
      href="https://refundablebooking.com/refundable-terms"
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] text-blue-500 underline"
    >
      View Refundable Terms
    </a>
  </div>
  <div className="flex items-center gap-2">
    {refundShieldOpted && (
      <span className="text-foreground font-medium text-sm">
        {formatPrice(refundShieldFee)}
      </span>
    )}
    <Switch
      checked={refundShieldOpted}
      onCheckedChange={onRefundShieldToggle}
    />
  </div>
</div>;
```

### b) Affirm Promo Banner (no changes needed)

The existing implementation in the integration plan is correct.

---

## Phase 8: Complete Data Flow

```
User toggles Refund Shield ON → refundShieldOpted = true
User clicks "Confirm Booking"
  │
  ├─ [standard flow, no RS]
  │     handleSubmit()
  │     confirmBookingAfterPayment({ paymentFlow: 'standard' })
  │     → POST /payments/refund-shield/report { opted: false } ← decline reported
  │
  ├─ [standard flow + RS opted]
  │     handleRefundShieldCheckout()
  │     collectAdvanceRazorpayPayment()     ← payment captured
  │     confirmBookingAfterPayment(...)     ← booking created
  │     POST /payments/refund-shield/report { opted: true, paymentVerified: true }
  │                                         ← RS API called ONLY HERE, after both gates pass
  │
  └─ [Affirm flow]
        handleAffirmCheckout()
        openAffirmCheckout()               ← Affirm modal opens
        collectAdvanceRazorpayPayment()    ← payment captured
        confirmBookingAfterPayment(...)    ← booking created
        POST /payments/affirm/authorize   ← calls AffirmController
              │
              ├─ AffirmProvider.authorizeAndGetVCN() (VCN for records)
              └─ RefundShieldService.reportSale({ opted: refundShieldOpted })
                    ← opted=true → booking_is_refundable: true  (RS activated)
                    ← opted=false → booking_is_refundable: false (decline logged)
```

**The two gates that must BOTH be true before `booking_is_refundable: true` is sent to Tego Group:**

1. `refundShieldOpted === true` (user explicitly toggled the switch)
2. Payment verified (endpoint is only reachable after `verifyAdvancePayment()` or `verifyBidDeposit()` succeeds upstream)

---

## Phase 8.1: Dual-Table Local Database Persistence

Local tracking of Refund Shield opt-in status is completely decoupled from the external Tego API calls to ensure unconditional accuracy across all four confirmation flows (Standard, Bid, Affirm, Refund Shield). This is implemented directly at the end of the `saveBookingToMySQL` method inside `external-flight.provider.ts`.

### 1. Compulsory Tracking Table (`refund_shield`)

Every single booking unconditionally inserts a row into the `refund_shield` table. The `refund_status` column is set to `"YES"` or `"NO"` based on the user's explicit opt-in choice.

### 2. Conditional Confirmation Table (`refundshieldbookingscnfrm`)

Immediately after the `refund_shield` insert, the system checks if the user actually opted in (`refundShieldOpted === true`). Only if true, the system inserts the full detailed breakdown (including the JSON `Products` array, passenger counts, and `BookingIsRefundable = true`) into the `refundshieldbookingscnfrm` table.

This ensures `refund_shield` acts as the compulsory tracking table, while `refundshieldbookingscnfrm` is strictly populated for valid opted-in buyers with the exact schema matching the Tego Group report.

---

## Phase 9: Booking Confirmation Email

Per the Tego Group spec, if the user opted in for Refund Shield, the confirmation email **must** include refund instructions. Add this to your email template when `refundShieldOpted === true`:

```
You have selected a Refundable Booking and may be eligible to apply for a
refund if you cannot attend your booking due to any reason listed in our
Refundable Terms: https://refundablebooking.com/refundable-terms

Click here to make a refund request: https://refundablebooking.com/request
```

---

## Phase 10: Verification & Testing

### Test the RS API Directly with cURL

```bash
curl --location 'https://refund-shield-sandbox-fae8a5117ef1.herokuapp.com/api/booking/' \
  --header 'Origin: https://ezeeflights.com' \
  --header 'Content-Type: application/json' \
  --data '{
    "apikey": "0274324dd1685193a00ad30342a326d8",
    "cid": "test-user-001",
    "cname": "Ahmed",
    "csurname": "Khan",
    "booking_paid_in_full": true,
    "booking_is_refundable": true,
    "booking_payment_value": 450.00,
    "booking_quantity": 2.0,
    "booking_total_transaction_value": 495.00,
    "booking_type": "TKT",
    "booking_name": "Flight KHI → LHR",
    "booking_reference": "EZF-TEST-001",
    "currency_code": "USD",
    "language_code": "EN",
    "date_of_purchase": "2026-06-08T10:00:00Z",
    "start_date_of_event": "2026-08-15T08:00:00Z",
    "products": [
      { "product_type": "TKT", "title": "Adult Ticket", "price": 225.00 },
      { "product_type": "TKT", "title": "Adult Ticket", "price": 225.00 }
    ]
  }'
```

### Test Decline Reporting

```bash
curl --location 'https://refund-shield-sandbox-fae8a5117ef1.herokuapp.com/api/booking/' \
  --header 'Origin: https://ezeeflights.com' \
  --header 'Content-Type: application/json' \
  --data '{
    "apikey": "0274324dd1685193a00ad30342a326d8",
    "cid": "test-user-002",
    "cname": "Sara",
    "csurname": "Ali",
    "booking_paid_in_full": true,
    "booking_is_refundable": false,
    "booking_payment_value": 450.00,
    "booking_quantity": 2.0,
    "booking_total_transaction_value": 450.00,
    "booking_type": "TKT",
    "booking_name": "Flight KHI → DXB",
    "booking_reference": "EZF-TEST-002",
    "currency_code": "USD",
    "language_code": "EN",
    "date_of_purchase": "2026-06-08T10:00:00Z",
    "start_date_of_event": "2026-09-01T06:00:00Z"
  }'
```

### Affirm Backend Test

```bash
curl -X POST http://localhost:4000/v1/payments/affirm/authorize \
  -H "Authorization: Bearer <your_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "checkoutToken": "test_token",
    "bookingId": "test-booking-001",
    "totalAmountUsdCents": 49500,
    "refundShieldOpted": true,
    "passengerCount": 2,
    "basketTotalUsd": 450.00,
    "userEmail": "test@ezeeflights.com",
    "userFirstName": "Ahmed",
    "userLastName": "Khan",
    "flightDate": "2026-08-15T08:00:00Z",
    "origin": "KHI",
    "destination": "LHR",
    "pnrCode": "EZF-TEST-001"
### Affirm Sandbox Testing Guidelines

To verify the combined Affirm + Refund Shield flow in the browser developer sandbox:

1. **Start Affirm Checkout**: Complete traveler details, toggle both **Refund Shield** and **Pay over time** (Affirm), and click the checkout button to open the Affirm modal.
2. **Enter Test Mobile Number**: Use a standard mock number:
   * **Clean Account (Recommended)**: Any random US number (e.g. `415-555-0123` with random last digits) to register a new mock profile.
   * **Standard Sandbox Numbers**: `415-555-0199` or `312-555-0122`.
3. **Verify via Sandbox PIN**:
   * **Bypass PIN**: Enter **`123456`** (or `1234`) when prompted for the verification code.
4. **Resolve Overdue Payment Screen (If Encountered)**:
   * If a standard sandbox profile has overdue payments (e.g. *"You have an overdue payment"*), you can either:
     * Close the modal and check out again using a **different random mobile number** to create a fresh clean test profile.
     * Or, clear the balance by inputting a sandbox mock debit card:
       * **Card Number**: `4111 1111 1111 1111` (Standard Visa test card)
       * **Expiration Date**: Any future date (e.g. `12/30`)
       * **CVC**: `123`
       * **ZIP**: `90210`
       * **Name**: Any name
5. **Complete Installment Selection**: Select a mock monthly payment term (e.g. 3, 6, or 12 months), accept terms, and click **Confirm**.
6. **Confirm Redirect**: The modal will close and the page will redirect to the EzeeFlights Confirmation Page showing the **Refund Shield Protection** active badge.

---

## Phase 11: Implementation Checklist

- [ ] `.env` — `REFUND_SHIELD_API_URL` and `REFUND_SHIELD_API_KEY` set correctly
- [ ] `.env` — `AFFIRM_PUBLIC_KEY`, `AFFIRM_PRIVATE_KEY` set
- [ ] `.env` — Frontend `NEXT_PUBLIC_AFFIRM_PUBLIC_KEY` and script URL set
- [ ] DB migration for new `payments` columns applied
- [ ] `refund-shield.service.ts` replaced with corrected version (correct body fields)
- [ ] `affirm.provider.ts` created and registered in `PaymentModule`
- [ ] `affirm.controller.ts` created — calls RS with `opted` flag as the gate
- [ ] `refund-shield.controller.ts` created for standard + RS flow
- [ ] Both controllers registered in `payment.module.ts`
- [ ] `handleRefundShieldCheckout` in `booking/page.tsx` updated to call `/payments/refund-shield/report`
- [ ] `handleAffirmCheckout` payload updated with `basketTotalUsd`, `userFirstName`, `userLastName`
- [ ] `confirmBookingAfterPayment` fires fire-and-forget decline report for non-opted bookings
- [ ] RS fee calculation verified: 10% of full basket (base + tax + seats + ancillaries + addons)
- [ ] `TripSummary.tsx` shows correct fee label and links to Refundable Terms
- [ ] Booking confirmation email template includes RS refund instructions when opted
- [ ] cURL tests pass for both opted and declined RS reporting
- [ ] End-to-end Affirm flow tested in sandbox
- [ ] RS `booking_reference` unique per booking (duplicate reference returns error from Tego)

---

## Open Questions

1. **`usdLedger.total` vs basket-before-RS** — Confirm whether `usdLedger.total` in `computeUsdLedgerTotals` already excludes the RS fee, or whether you need to pass `usdLedger.total - usdLedger.refundShieldFee` as `basketTotalUsd`.

2. **Affirm Private Key** — You have the public key (`WCE4XYM8ENAIT5LN`). The private key is needed for server-side VCN calls. Find it in the Affirm merchant sandbox dashboard under API Keys.

3. **Retry mechanism** — The Tego spec recommends recording RS API call success against each purchase so failed calls can be retried. Consider adding a `refund_shield_reported` boolean and `refund_shield_error` column to `payments` (included in Phase 2 schema) and running a periodic retry job.

4. **Production RS key** — The sandbox key is `0274324dd1685193a00ad30342a326d8`. You need a separate key from your Tego account manager for production.

5. **Eligibility check** — Tego spec requires you confirm the booking is under £5,000 per person and departure is within 18 months before offering RS. Add a guard in `TripSummary.tsx` to hide the RS toggle if these conditions fail.
