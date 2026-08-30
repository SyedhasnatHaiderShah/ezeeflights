# EzeeFlights - System Updates & Feature Implementation Summary

This document summarizes all code changes, database fixes, payment flow enhancements, and UI updates implemented across the EzeeFlights monorepo.

---

## 1. Staged Files Code Review Summary (7 Staged Files)

### 1. 📄 [`affirm_refundshield_implementation_plan.md`](file:///d:/aws/ezeeflights-aws/affirm_refundshield_implementation_plan.md)

- **Status**: **✅ VERIFIED**
- **Changes**: Added complete Affirm developer sandbox testing guide, including PIN (`123456`), sandbox test numbers, and instructions to bypass/clear overdue payments using mock Visa card `4111 1111 1111 1111`.

### 2. ⚡ [`external-flight.provider.ts`](file:///d:/aws/ezeeflights-aws/apps/backend/src/common/providers/external-flight.provider.ts)

- **Status**: **✅ VERIFIED & TESTED**
- **Changes**:
  - Fixed database schema column typo `grand_total` ➔ `grand_tota` in `refund_shield` table insert query.
  - Replaced one-way `UPDATE` with **`UPSERT` logic** (`SELECT Id FROM affirmpayment WHERE CheckoutToken = ?`), automatically performing an `INSERT` if no pre-existing row is found or `UPDATE` if it exists.
  - Added explicit `[DB_WRITE]` log lines to trace every table write.

### 3. 🛡️ [`affirm.controller.ts`](file:///d:/aws/ezeeflights-aws/apps/backend/src/modules/payment/controllers/affirm.controller.ts)

- **Status**: **✅ VERIFIED & TESTED**
- **Changes**:
  - Added safe optional chaining (`req?.user?.email`, `req?.user?.userId`) to prevent `TypeError` exceptions during guest user (unauthenticated) checkouts.
  - Implemented sandbox 404 fallback: if Affirm's `/api/v2/charges` API is unfulfilled in developer mode, it gracefully returns a sandbox card payload instead of throwing a 500 error.
  - Replaced direct `INSERT INTO affirmpayment` with **`UPSERT` logic** to prevent duplicate rows in `affirmpayment`.

### 4. 🤖 [`ai.controller.ts`](file:///d:/aws/ezeeflights-aws/apps/backend/src/modules/ai/controllers/ai.controller.ts)

- **Status**: **✅ VERIFIED**
- **Changes**: Wrapped Gemini extraction in a try-catch block to automatically fallback to OpenAI upon any network failure or API limit, returning `_provider: "Gemini"` or `_provider: "OpenAI"`.

### 5. 🎨 [`AskEzeeDesktop.tsx`](file:///d:/aws/ezeeflights-aws/apps/frontend/components/ai/AskEzeeDesktop.tsx)

- **Status**: **✅ VERIFIED**
- **Changes**: Integrated `useNavChromeSurface()` hook to track header scroll state (`isHeroMode`). Applies `bg-[#0e0e0e]/60 backdrop-blur-xl border border-white/10 dark text-white` when at the top of the home page, and switches to solid styling when scrolled down.

### 6. 💬 [`AskEzeeChatContent.tsx`](file:///d:/aws/ezeeflights-aws/apps/frontend/components/ai/AskEzeeChatContent.tsx)

- **Status**: **✅ VERIFIED**
- **Changes**: Added support for `isGlass?: boolean` prop, adjusting the chat background, input footer, and text message bubbles to semi-transparent glass styling when hero mode is active.

### 7. 🎙️ [`use-ask-ezee.ts`](file:///d:/aws/ezeeflights-aws/apps/frontend/lib/hooks/use-ask-ezee.ts)

- **Status**: **✅ VERIFIED**
- **Changes**:
  - Prints `[AskEzee] AI extraction successful. Provider: <provider>` to browser console.
  - Automatically defaults flight/hotel departure dates to **7 days from today** when unspecified in user's voice prompt.

---

## 2. Affirm BNPL & Refund Shield Integration

### Backend Database Fixes & Enhancements

#### [`external-flight.provider.ts`](file:///d:/aws/ezeeflights-aws/apps/backend/src/common/providers/external-flight.provider.ts)

- **Schema Column Correction**: Fixed MySQL table column typo in `refund_shield` table insert query: changed `grand_total` to `grand_tota` to align with legacy database schema.
- **Upsert Logic for `affirmpayment`**:
  - Implemented `SELECT Id FROM affirmpayment WHERE CheckoutToken = ?` check before database writes.
  - If row exists (created by `AffirmController`), runs `UPDATE affirmpayment SET BookingRef = ?`.
  - If row is missing, executes `INSERT INTO affirmpayment` with `BookingRef`, `CheckoutToken`, `PaymentAmount`, `Currency`, `Phone`, `Email`, `PaidAt`, `CreatedAt`.
  - **Result**: Completely eliminated duplicate row creation and guaranteed 1 row per checkout.
- **Detailed Database Logging**: Added explicit `[DB_WRITE]` log lines to trace every database insert/update (`tbl_customerdetails`, `tbl_customer`, `tbl_flightdetailshtml`, `refund_shield`, `refundshieldbookingscnfrm`, `affirmpayment`).

#### [`affirm.controller.ts`](file:///d:/aws/ezeeflights-aws/apps/backend/src/modules/payment/controllers/affirm.controller.ts)

- **Guest Checkout Null Safety**: Replaced direct property reads on `req.user` with optional chaining (`req?.user?.email`, `req?.user?.userId`). Prevents `TypeError` 500 internal server errors when non-logged-in guest users check out.
- **Sandbox Fallback Handling**: Added a catch block fallback for sandbox mode when server-side VCN exchange returns a 404/error. Generates a valid mock card payload so sandbox checkouts finish cleanly.
- **Single-Row Upsert Logic**: Replaced direct `INSERT INTO affirmpayment` with an upsert check (`SELECT Id FROM affirmpayment WHERE CheckoutToken = ? OR BookingRef = ?`). If a row was already inserted by `saveBookingToMySQL()`, it updates the existing row with full VCN JSON rather than creating a second duplicate row.

#### [`affirm_refundshield_implementation_plan.md`](file:///d:/aws/ezeeflights-aws/affirm_refundshield_implementation_plan.md)

- **Sandbox Testing Guide**: Added step-by-step instructions for testing combined Affirm + Refund Shield flow in browser developer mode, including PIN `123456`, mock card details (`4111 1111 1111 1111`), and handling overdue payment screens by switching test numbers.

---

## 3. AI Voice Assistant & UI Enhancements

#### [`AskEzeeDesktop.tsx`](file:///d:/aws/ezeeflights-aws/apps/frontend/components/ai/AskEzeeDesktop.tsx)

- **Header Scroll Sync**: Removed manual scroll listener and integrated the shared `useNavChromeSurface()` hook to track header scroll state (`isHeroMode`).
- **Hero Glassmorphism**: When at the top of the home page (`isHeroMode` is true), applies frosted glass styling (`bg-[#0e0e0e]/60 backdrop-blur-xl border border-white/10 dark text-white`). Switches to solid card background when scrolled down or navigating subpages.

#### [`AskEzeeChatContent.tsx`](file:///d:/aws/ezeeflights-aws/apps/frontend/components/ai/AskEzeeChatContent.tsx)

- **Glass Prop Support**: Added `isGlass?: boolean` prop mapping to render semi-transparent backgrounds and message bubbles when glass mode is active.

#### [`use-ask-ezee.ts`](file:///d:/aws/ezeeflights-aws/apps/frontend/lib/hooks/use-ask-ezee.ts)

- **AI Provider Console Logging**: Logs active AI extraction model (`[AskEzee] AI extraction successful. Provider: Gemini` or `OpenAI`) directly to browser `console.log`.
- **Default 7-Day Departure Date**: Automatically defaults flight/hotel departure dates to **7 days from today** when unspecified in user voice queries.

#### [`ai.controller.ts`](file:///d:/aws/ezeeflights-aws/apps/backend/src/modules/ai/controllers/ai.controller.ts)

- **OpenAI Fallback Guard**: Wrapped Gemini extraction calls in try-catch handlers to automatically trigger OpenAI failover if Gemini fails or hits rate limits, returning `_provider: "Gemini"` or `_provider: "OpenAI"`.

---

## 4. Database Table Mapping Reference

| Table Name                  | Description                              | Status                      |
| :-------------------------- | :--------------------------------------- | :-------------------------- |
| `tbl_customerdetails`       | Primary booking reference record         | Active                      |
| `tbl_customer`              | Passenger list linked to booking         | Active                      |
| `tbl_flightdetailshtml`     | Rendered itinerary HTML blocks           | Active                      |
| `affirmpayment`             | Affirm virtual card & loan records       | Active (Upserted)           |
| `refund_shield`             | Decoupled Refund Shield opt-in log       | Active (`grand_tota`)       |
| `refundshieldbookingscnfrm` | Detailed confirmation sent to Tego Group | Active (Opted-in only)      |
| `affirmbookingforms`        | Legacy email link forms                  | Unused (Inline BNPL active) |

ere is the code review of the 7 staged files:

1. 📄 affirm_refundshield_implementation_plan.md
   Status: ✅ VERIFIED
   Changes: Added complete Affirm developer sandbox testing guide, including PIN (123456), sandbox test numbers, and instructions to bypass/clear overdue payments using mock Visa card 4111 1111 1111 1111.
2. ⚡ external-flight.provider.ts (apps/backend/src/common/providers)
   Status: ✅ VERIFIED & TESTED
   Changes:
   Fixed database schema column typo grand_total ➔ grand_tota in refund_shield table insert query.
   Replaced one-way UPDATE with UPSERT logic (SELECT Id FROM affirmpayment WHERE CheckoutToken = ?), automatically performing an INSERT if no pre-existing row is found or UPDATE if it exists.
   Added explicit [DB_WRITE] log lines to trace every table write.
3. 🛡️ affirm.controller.ts (apps/backend/src/modules/payment/controllers)
   Status: ✅ VERIFIED & TESTED
   Changes:
   Added safe optional chaining (req?.user?.email, req?.user?.userId) to prevent TypeError exceptions during guest user (unauthenticated) checkouts.
   Implemented sandbox 404 fallback: if Affirm's /api/v2/charges API is unfulfilled in developer mode, it gracefully returns a sandbox card payload instead of throwing a 500 error.
   Replaced direct INSERT INTO affirmpayment with UPSERT logic to prevent duplicate rows in affirmpayment.
4. 🤖 ai.controller.ts (apps/backend/src/modules/ai/controllers)
   Status: ✅ VERIFIED
   Changes: Wrapped Gemini extraction in a try-catch block to automatically fallback to OpenAI upon any network failure or API limit, returning \_provider: "Gemini" or \_provider: "OpenAI".
5. 🎨 AskEzeeDesktop.tsx (apps/frontend/components/ai)
   Status: ✅ VERIFIED
   Changes: Integrated useNavChromeSurface() hook to track header scroll state (isHeroMode). Applies bg-[#0e0e0e]/60 backdrop-blur-xl border border-white/10 dark text-white when at the top of the home page, and switches to solid styling when scrolled down.
6. 💬 AskEzeeChatContent.tsx (apps/frontend/components/ai)
   Status: ✅ VERIFIED
   Changes: Added support for isGlass?: boolean prop, adjusting the chat background, input footer, and text message bubbles to semi-transparent glass styling when hero mode is active.
7. 🎙️ use-ask-ezee.ts (apps/frontend/lib/hooks)
   Status: ✅ VERIFIED
   Changes:
   Prints [AskEzee] AI extraction successful. Provider: <provider> to browser console.
   Automatically defaults flight/hotel departure dates to 7 days from today when unspecified in user's voice prompt.
