# Cheap Bid — Feature Guide

## What is Cheap Bid?

**Cheap Bid** is a time-limited price override created by an admin or agent for a **specific flight itinerary**. The agent sets lower adult/child/infant prices and a **link expiry** (e.g. 24 hours). The customer pays a **fully refundable deposit** via Razorpay to lock the fare.

| Outcome                             | Action                                       |
| ----------------------------------- | -------------------------------------------- |
| Booking completes within the window | Deposit applied; customer pays the bid price |
| Bid expires without booking         | Full deposit refunded to the customer        |

This is separate from **Spanish Jetcost** (`usa_table` markups) and separate from the legacy **`tbl_cheap_bid`** booking-audit row written at CRM checkout time.

---

## API source behaviour

| `FLIGHTS_API_SOURCE` | Spanish Jetcost (`usa-markup`)           | Cheap Bid      |
| -------------------- | ---------------------------------------- | -------------- |
| `travelport`         | Applied from `spanish_jetcost.usa_table` | Always applied |
| `external`           | **Skipped** (API already has discount)   | Always applied |
| `proxy`              | **Skipped**                              | Always applied |

Logic lives in `FlightService.searchFlights()`:

1. Provider search (Travelport **or** external/proxy)
2. `UsaMarkupService.applyMarkupsToFlights()` — **only when** `FLIGHTS_API_SOURCE=travelport`
3. `CheapBidService.applyCheapBidsToFlights()` — **always**

---

## Database schema (MySQL / MariaDB CRM — `worldrix_ezeecrm`)

Migration: [`sql/migrations/061_cheap_bid_offers.sql`](../sql/migrations/061_cheap_bid_offers.sql)

Tables are also bootstrapped via `ensure-mysql-crm-schema.ts` on CRM connection.

### Collation (MariaDB / MySQL 5.7)

Production CRM runs on **MariaDB** (e.g. `10.6.x`). Do **not** use `COLLATE=utf8mb4_0900_ai_ci` — that collation is **MySQL 8.0 only** and fails on MariaDB with:

```
Error Code: 1273. Unknown collation: 'utf8mb4_0900_ai_ci'
```

DDL below uses `utf8mb4_general_ci` (same as `061_cheap_bid_offers.sql` and legacy `tbl_customer`). If you export from MySQL 8, replace or remove `utf8mb4_0900_ai_ci` before running on MariaDB.

### 1. `tbl_cheap_bid_offer` — the bid offer

| Column           | Type                          | Purpose                                                                   |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------- | ------- | ------------- |
| `id`             | INT PK AUTO_INCREMENT         | Primary key; also used as share link token (`/cheap-bid/{id}`)            |
| `source`         | VARCHAR(25)                   | Site source (Ezeeflight US, CA, UK, UAE, etc.)                            |
| `originFrom`     | VARCHAR(10)                   | Origin airport code                                                       |
| `destinationTo`  | VARCHAR(10)                   | Destination airport code                                                  |
| `airLine`        | VARCHAR(10)                   | Marketing carrier code                                                    |
| `travellType`    | VARCHAR(10)                   | `OneWay` \| `Return`                                                      |
| `cabin`          | VARCHAR(25)                   | e.g. Economy                                                              |
| `departureDate`  | DATETIME                      | Outbound travel date                                                      |
| `returnDate`     | DATETIME                      | Return date (return trips)                                                |
| `bidAdtPrice`    | DOUBLE                        | Discounted adult price set by admin                                       |
| `bidChdPrice`    | DOUBLE                        | Discounted child price                                                    |
| `bidInfPrice`    | DOUBLE                        | Discounted infant price                                                   |
| `currency`       | varchar(5) DEFAULT `USD`      | Fare currency                                                             |
| `discountType`   | VARCHAR(20) DEFAULT `replace` | Discount calculation type (`replace`                                      | `fixed` | `percentage`) |
| `linkExpiryDate` | DATETIME                      | When the offer stops matching search                                      |
| `status`         | VARCHAR(20) DEFAULT `active`  | `active` \| `expired` \| `booked` \| `refunded` \| `cancelled`            |
| `flightId`       | VARCHAR(255)                  | Original flight ID for comparison                                         |
| `stops`          | INT                           | Stops filter (NULL / 'any' matches any stops, otherwise must match exactly) |
| `created_at`     | DATETIME                      | Row created (auto)                                                        |
| `updated_at`     | DATETIME                      | Row updated (auto)                                                        |

**Indexes:** `route_status_expiry_index` (`originFrom`, `destinationTo`, `status`, `linkExpiryDate`), `status_index`, `linkExpiryDate_index`.

### How one FlightCard gets the Cheap Bid price

Example: LGA→PUJ on 16 Jul, Air Canada, dep **06:30**.

1. Admin creates a cheap bid offer on `tbl_cheap_bid_offer` with matching route (LGA, PUJ), date, airline (AC), link expiry, and optional flight timings.
2. User searches LGA→PUJ on that date → `findActiveOffersForRoute()` loads active offers.
3. For each search result flight, `findAllMatchingOffers()` matches the route, airline code, cabin class, journey type, and stops limit.
4. Departure and Return time matching rules:
   - **Specific Flight Time**: If the cheap bid offer departure/return date includes a specific time component (e.g. `11:30` or `18:45`), the flight outbound/inbound departure time must match within **60 minutes** (1 hour) of the cheap bid time. Otherwise, the bid is not applied.
   - **Date-Only**: If the cheap bid departure/return date is date-only (UTC midnight `00:00:00`), it matches any flight on that calendar day (within a 24-hour tolerance window).
5. Only the matching card gets `cheapBidApplied` and the discounted `totalFare` → **Cheap Bid** header on the `FlightCard`.
6. Other cards on the same route (different timings, different airline, different cabin class, different connection stops, etc.) keep normal prices.

### 2. `tbl_cheap_bid_status` — running status toggle

| Column           | Type                          | Purpose                                                                   |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `id`             | INT PK AUTO_INCREMENT         | Primary key                                                               |
| `running_status` | VARCHAR(20) DEFAULT `Stop`    | Engine operational toggle (`Start` or `Stop`)                             |

### 3. `tbl_cheap_bid_payment` — Razorpay deposit ledger

Every Razorpay deposit for a cheap bid checkout is recorded here, mirroring the `refund_shield` pattern.

| Column | Type | Purpose |
|---|---|---|
| `booking_ref` | VARCHAR(255) | CRM Booking Ref linked after successful booking |
| `bid_offer_id` | INT | FK to `tbl_cheap_bid_offer.id` |
| `razorpay_order_id` | VARCHAR(255) | Razorpay order reference ID |
| `razorpay_payment_id` | VARCHAR(255) | Razorpay transaction payment ID |
| `payment_status` | VARCHAR(30) | `pending` \| `paid` \| `failed` |
| `amount` | DECIMAL(10,2) | Total paid amount |
| `currency` | VARCHAR(10) | Payment currency (e.g. `USD`) |
| `grand_total` | DECIMAL(10,2) | Grand total price calculated for passengers |
| `razorpay_response` | JSON | Full Razorpay verification response payload |

### Full DDL — MariaDB-safe (run on `worldrix_ezeecrm`)

```sql
-- CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci (not utf8mb4_0900_ai_ci)

CREATE TABLE `tbl_cheap_bid_offer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` varchar(25) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `originFrom` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `destinationTo` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `airLine` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `travellType` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cabin` varchar(25) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departureDate` datetime DEFAULT NULL,
  `returnDate` datetime DEFAULT NULL,
  `bidAdtPrice` double DEFAULT NULL,
  `bidChdPrice` double DEFAULT NULL,
  `bidInfPrice` double DEFAULT NULL,
  `currency` varchar(5) COLLATE utf8mb4_general_ci DEFAULT 'USD',
  `discountType` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'replace',
  `linkExpiryDate` datetime DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'active',
  `flightId` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `stops` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `route_status_expiry_index` (`originFrom`,`destinationTo`,`status`,`linkExpiryDate`),
  KEY `status_index` (`status`),
  KEY `linkExpiryDate_index` (`linkExpiryDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tbl_cheap_bid_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `running_status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Stop',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Existing databases that already ran an older `061` with `tbl_cheap_bid_flight_html` should run [`sql/migrations/062_drop_cheap_bid_flight_html.sql`](../sql/migrations/062_drop_cheap_bid_flight_html.sql). Flight display uses `FlightCard` built dynamically from the offer details, not stored HTML.

### Legacy: `tbl_cheap_bid` (booking audit)

`ExternalFlightProvider` still inserts into **`tbl_cheap_bid`** (`booking_ref`, `bid_status`, `bid_price`, …) on every booking — same pattern as `refund_shield`. That table is **not** the admin offer store; do not confuse it with `tbl_cheap_bid_offer`.

---

## Backend module

**Path:** `apps/backend/src/modules/cheap-bid/`

Replaces the old `standby-deals` module (Postgres `standby_deals` / Razorpay-only flow).

| File                            | Role                                                               |
| ------------------------------- | ------------------------------------------------------------------ |
| `cheap-bid.module.ts`           | Nest module                                                        |
| `cheap-bid.service.ts`          | CRUD, search matching, deposit/verify, `applyCheapBidsToFlights()` |
| `cheap-bid.repository.ts`       | MySQL CRM queries                                                  |
| `cheap-bid.controller.ts`       | Public API                                                         |
| `cheap-bid-admin.controller.ts` | Admin CRUD                                                         |
| `entities/cheap-bid.entity.ts`  | Types                                                              |
| `dto/create-cheap-bid.dto.ts`   | Create payload                                                     |

### Public REST (`/v1/cheap-bid`)

| Method | Path                           | Description              |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/search?origin=&destination=` | Active offer for route   |
| GET    | `/token?token=`                | Resolve shareable link   |
| POST   | `/deposit/create-order`        | Razorpay deposit         |
| POST   | `/deposit/verify`              | Verify payment signature |

**Legacy alias:** `/v1/bid-deals/*` still works for existing frontend calls.

### Admin REST (`/v1/admin/cheap-bid`)

| Method | Path             | Description                       |
| ------ | ---------------- | --------------------------------- |
| GET    | `/?page=&limit=` | List offers                       |
| GET    | `/:id`           | Get one offer (+ segments + HTML) |
| POST   | `/`              | Create offer                      |
| PATCH  | `/:id`           | Update offer / status             |

Permission: `FLIGHTS.MARKUP` (same as Spanish Jetcost admin).

### Create offer example

```json
POST /v1/admin/cheap-bid
{
  "source": "Ezeeflight CA",
  "originFrom": "LGA",
  "destinationTo": "PUJ",
  "airLine": "AC",
  "travellType": "OneWay",
  "cabin": "Economy",
  "departureDate": "2026-07-16T00:00:00.000Z",
  "bidAdtPrice": 240,
  "bidChdPrice": 200,
  "bidInfPrice": 50,
  "currency": "USD",
  "discountType": "replace",
  "linkExpiryDate": "2026-07-02T12:00:00.000Z",
  "stops": 1
}
```

---

## Search matching & Time Validation

When a user searches, `CheapBidService`:

1. Loads active `tbl_cheap_bid_offer` rows matching the query's route.
2. Filters offers in memory by:
   - Airline code
   - Journey type
   - Exact cabin class match (if specified in the offer)
   - Exact connection stops match (if specified in the offer. If stops is `null`/`undefined`, it acts as "any" stops and matches any flight of the airline).
3. Performs timezone-agnostic date and time checks against the flight segments:
   - **Local Time extraction**: Outbound departure time and inbound return time are extracted from the local strings in the flight segments (`DepartureTime` / `departureDate`), avoiding UTC timezone conversion offsets.
   - **Strict Time Match**: If the cheap bid contains a specific hour/minute component (e.g. `11:30`), the flight's local segment departure time must be within **60 minutes** (1 hour) of the cheap bid timing.
   - **Date-Only Match**: If the cheap bid is date-only (`00:00:00`), it matches any flight departing on that calendar day (within a 24-hour window).
   - **Return Leg verification**: The return flight's timing is matched against `offer.returnDate`.
4. Replaces `totalFare` and `baseFare` with the discounted total and sets `cheapBidApplied` metadata on the flight entity.

Frontend `FlightCard` shows the **Cheap Bid** header when `flight.cheapBidApplied` is present.

---

## Frontend

| File                                           | Change                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `components/flights/FlightCard.tsx`            | "Cheap Bid" header; reads `cheapBidApplied`                        |
| `app/flights/result/FlightSearchContainer.tsx` | Prefer server `cheapBidApplied` and persists sort mode in URL.     |
| `lib/types/flight-api.ts`                      | `cheapBidApplied` type                                             |
| `lib/api/bid-deals.ts`                         | Still calls `/bid-deals/*` (legacy alias)                          |
| `components/admin/AdminCheapBid.tsx`           | Admin create form; **View** opens `FlightCard` built dynamically   |

---

## Customer / booking link model

```
tbl_cheap_bid_offer (id, bid prices, route, expiry, status)
       │
       │ Share link: /cheap-bid/{id}
       │ Razorpay deposit (no separate table)
       ↓ on book
tbl_customerdetails + tbl_flightdetailshtml + tbl_cheap_bid (legacy booking audit)
```

---

## Discount pricing resolution & safety override

When a Cheap Bid is resolved:
1. **Search Phase**: Performed in `cheap-bid.service.ts:applyOfferPrices`. Discounted prices for adults, children, and infants are computed based on the discount type (`replace`, `percentage`, `fixed`).
   - **GDS Live Price Fallback**: If `bidChdPrice` or `bidInfPrice` are `null` (blank columns in the Excel import), they do **not** default to the adult price or `0`. Instead, their values fall back directly to the original live GDS fares, meaning only the adult price is discounted.
2. **Selection Phase**: Verified in `flight.service.ts:selectFlight`.
   - **Expected Total validation**: Re-calculates passenger-specific fares using the same GDS fallback rules. It compares the expected total against the cache to authorize the selection.
3. **Checkout Phase**: Handled in `flight-crm-booking.service.ts`.
   - **Backend Safety Override**: During checkout (`submit`), the backend validates the submitted price against the bid's configuration with a 10% tolerance. It then explicitly overwrites `dto.flightSnapshot.flightFare` and all totals (`baseFare`, `tax`, `totalFare`, `totalCost`, and user equivalents) with the correct sum of resolved passenger fares. This ensures the database tables (`tbl_customer`, `tbl_customerdetails`, and passenger audits) always record the correct absolute dollar amounts per passenger and correct overall totals.
4. **Non-Bid Bookings**:
   - For standard (non-bid) bookings, the pricing goes through the default checkout route without matching `cheapBidApplied` or overriding `flightFare` values with cheap bid databases. Fares are saved directly from the GDS provider/cache.

---

## Duplicate Deal Validation & Timezone-Neutral Imports

To prevent duplicate records from being created when importing Excel sheets multiple times, the server runs strict matching logic in `cheap-bid.repository.ts`:

1. **Duplicate Matching Fields**: The server identifies existing deals by matching:
   - Origin (`originFrom`) & Destination (`destinationTo`)
   - Carrier Airline (`airLine`) & Travel Type (`travellType` - e.g., Return vs. OneWay)
   - Cabin Class (`cabin`) & Max connection stops (`stops`)
   - Specific Flight identifier (`flightId` - if configured)
   - Outbound departure time (`departureDate`) & Return departure time (`returnDate`)
2. **Timezone-Agnostic Comparison**: JS Date objects undergo driver timezone conversions when querying databases. To prevent this, the repository uses a custom helper `toMysqlDateTimeString()` to format dates directly as literal `"YYYY-MM-DD HH:mm:ss"` string parameters. This makes database queries and insertion operations fully immune to connection timezone offsets.
3. **Upsert Actions**:
   - **Exact Duplicate**: If all fields AND prices/expiries match (`findExactDuplicateOffer`), the row is skipped.
   - **Modified Duplicate**: If fields match but prices or expiries differ (`findDuplicateOffer`), the server updates the existing row in-place.
   - **New Offer**: Otherwise, it inserts a new row.

---

## Environment

```env
FLIGHTS_API_SOURCE=external   # or travelport | proxy
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
MYSQL_DATABASE=worldrix_ezeecrm
```

---

## Related docs

- [`api-routing-proxy-external.md`](../api-routing-proxy-external.md) — API source routing
- [`md/bid-deals.md`](bid-deals.md) — **superseded** by this doc for the old standby-deals design
- Spanish Jetcost: `apps/backend/src/modules/usa-markup/`

---

## Known Issues & Fixes

### 🐛 Bid Price Mismatch — Frontend Double-Conversion Bug

**Date Fixed:** 2026-08-17  
**Symptoms:**
- User clicks a bid flight card but gets error: `"Bid price mismatch. Please refresh and try again."`
- Backend log shows different USD totals even on repeated refresh of the same page:
  ```
  [FlightService:DEV:bidSelectFlight] CHECK | bidTotal=874.026 USD | uiTotalUsd=772.1516 USD | isPriceMatch=false
  ```
- Affects `discountType: "percentage"` bids when the user's display currency is **not USD** (e.g. PKR, GBP, EUR)
- `discountType: "replace"` bids are less affected because the DB stores the final USD price directly

---

#### Root Cause

`bidAdtPrice`, `bidChdPrice`, `bidInfPrice` stored in **`cheapBidApplied`** (attached to every matched flight) are already the **server-computed discounted fares in USD**. This is true for ALL discount types:

| `discountType` | DB `bidAdtPrice` value | `cheapBidApplied.bidAdtPrice` value |
|---|---|---|
| `replace` | Final absolute price (e.g. `$240`) | Same as DB: `$240` |
| `percentage` | Discount % (e.g. `15` = 15%) | Computed: `origAdt × (1 - 15/100)` in **USD** |
| `fixed` | Fixed amount to subtract (e.g. `$50`) | Computed: `origAdt - $50` in **USD** |

The `applyOfferPrices()` function (in `cheap-bid.service.ts`) correctly computes the discounted fares and stores them in **USD** in `cheapBidApplied`, and **also overwrites** `flight.flightFare.adultFare/childFare/infantFare` with the same USD values.

The bug was in the **frontend** `getSelectApiFareBreakdown()` function (and its display counterpart `getDisplayFareBreakdown()`) inside `FlightCard.tsx`:

```js
// ❌ BROKEN — before fix
const result = {
  fareTotal: getConvertedAmount(
    flight.cheapBidApplied ? (baseP + taxP) : rawTotal,
    flightSourceCurrency,  // ← could be "PKR" (user's display currency)
    SELECT_API_CURRENCY,   // "USD"
  ),
  ...
};
```

Where `baseP` was computed from `flight.flightFare.adultFare` (which is in **USD**), but then converted **from `flightSourceCurrency` → USD**. When `flightSourceCurrency = "PKR"`, this divided the USD value by the PKR exchange rate — producing a tiny fraction of the correct price:

```
baseP = 393.01 + 377.43 + 103.58 = 874.02 (USD, correct)
fareTotal = convert(874.02, "PKR", "USD") → ~$3.14  ❌
```

> ⚠️ **Why `flightSourceCurrency` became `"PKR"`**: The frontend maps the backend `flight.currency` field to `flightSourceCurrency`. For bid flights the backend stores `currency: offer.currency || "USD"`, so in theory it should always be `"USD"`. However the frontend search result mapper sometimes sets `flight.currency` to the user's display currency during API response hydration, creating the mismatch.

---

#### The Fix

Instead of going through `flightFare + flightSourceCurrency`, directly read `cheapBidApplied.bidAdtPrice/bidChdPrice/bidInfPrice` (which are always in the bid's own currency = USD) and compute the total:

```js
// ✅ FIXED — after fix
if (flight.cheapBidApplied) {
  const bidMeta = flight.cheapBidApplied;
  const adt = Number(searchParams.get("adt") || 1);
  const chd = Number(searchParams.get("chd") || 0);
  const inf = Number(searchParams.get("inf") || 0);
  const bidCurrency = (bidMeta as any).currency || "USD";  // always USD
  const bidTotal =
    adt * Number(bidMeta.bidAdtPrice ?? 0) +
    chd * Number(bidMeta.bidChdPrice ?? bidMeta.bidAdtPrice ?? 0) +
    inf * Number(bidMeta.bidInfPrice ?? 0);
  const fareTotal = getConvertedAmount(bidTotal, bidCurrency, SELECT_API_CURRENCY);
  return { fareTotal, baseFare: fareTotal, tax: 0, currency: SELECT_API_CURRENCY };
}
```

This produces the **same total the backend computes in `bidSelectFlight()`**, so the mismatch is eliminated.

---

#### Files Changed

| File | What Changed |
|---|---|
| [`apps/frontend/components/flights/FlightCard.tsx`](apps/frontend/components/flights/FlightCard.tsx) | `getSelectApiFareBreakdown()` + `getDisplayFareBreakdown()`: bid shortcut reads `cheapBidApplied` directly |
| [`apps/frontend/components/admin/BidFlightCard.tsx`](apps/frontend/components/admin/BidFlightCard.tsx) | Same fix in the admin card component |
| [`apps/backend/src/modules/flight/services/flight.service.ts`](apps/backend/src/modules/flight/services/flight.service.ts) | Added `FlightEntity[]` type annotation to `allFlights` on cache-hit path (TS error fix) |

---

#### How to Diagnose This Bug in Future

**Step 1 — Check backend logs for the mismatch signature:**
```
[FlightService:DEV:bidSelectFlight] CHECK | bidTotal=XXX USD | uiTotalUsd=YYY USD | isPriceMatch=false
```
If `bidTotal ≠ uiTotalUsd`, the frontend sent a wrong `fareTotal`.

**Step 2 — Check the frontend console log:**
```
[FlightCard:FareDebug] getSelectApiFareBreakdown (BID direct) -> flightId=..., adt=1 chd=1 inf=1, bidTotal=874.02 USD, fareTotal=874.02 USD
```
After the fix, you should see `(BID direct)` in the log and `bidTotal = fareTotal` when bid currency is USD.

**Step 3 — Cross-check bid prices from DB vs. backend cache:**
```
[FlightService:bidSelectFlight] Using pre-computed percentage bid prices from cache: adt=393.01 chd=377.43 inf=103.58
```
These are the values the backend expects. The frontend must send `1×393.01 + 1×377.43 + 1×103.58 = 874.02` as `fareTotal`.

---

#### Key Invariants (never break these)

1. **`cheapBidApplied.bidAdtPrice/bidChdPrice/bidInfPrice` are always in the bid's `currency` (USD)** — never in the user's display currency. Do not re-convert them through `flightSourceCurrency`.

2. **`discountType: "percentage"` stores the discount percentage in the DB** (`bidAdtPrice = 15` means 15% off). The **computed dollar discount** is stored in `cheapBidApplied` only after `applyOfferPrices()` runs. Never use the raw DB `bidAdtPrice` for percentage bids directly as a dollar price.

3. **`fareTotal` sent to `/api/flights/bidselect` must be in USD** (`SELECT_API_CURRENCY = "USD"`). The backend validates it against `bidTotal` converted to USD with a tolerance of `±$50` (for percentage bids) or `±$2` (for replace/fixed bids).

4. **Tolerance values in `bidSelectFlight()`** (in `flight.service.ts`):
   ```ts
   const tolerance = discountType === "percentage" ? 50.00 : 2.00;
   ```
   If the mismatch consistently exceeds `$50`, the bug is on the **frontend price calculation**, not floating-point rounding.

---

### 🐛 Child / Infant GDS Price Fallback Bug in New Tabs (Incognito Mode)

**Date Fixed:** 2026-08-17  
**Symptoms:**
- User opens a bid itinerary URL in a new browser/incognito session.
- The Adult price is correct (e.g. `$199.00`), but the Child price is incorrect (e.g. shows `$199.00` instead of the original GDS child price `$218.44`), or is `$0.00`.
- The database configuration has `bidChdPrice: null` (meaning the child fare should not be discounted and should fall back to the live GDS rate).

---

#### Root Cause

When a new browser/incognito session hits the itinerary URL:
1. The Zustand store (where the select state was cached) is empty.
2. The frontend fetches the flight details via `GET /api/flights/:id`.
3. If the cache was overwritten by standard searches/selections, the cached flight loses `cheapBidApplied`. To resolve this, the backend controller re-applies bid prices using `applyCheapBidById()`.
4. **Issue 1**: The backend `applyCheapBidById()` was called without knowing the passenger counts and had hardcoded `trip: 'round-trip'` and `flightWay: 2`. For one-way flights (like bid #145), this mismatch caused the bid matching logic to fail completely, returning `cheapBidApplied = null`.
5. **Issue 2**: When `cheapBidApplied` is null, the frontend fell back to `standbyDeal.bidChdPrice ?? standbyDeal.bidAdtPrice` to show the passenger breakdown. Since `bidChdPrice` is null in the DB, it incorrectly used `bidAdtPrice` (`$199.00`) as the child fare!

---

#### The Fix

1. **Frontend Query Params**: Updated `itinerary/page.tsx` to pass the passenger counts in the URL query parameters during flight details fetch:
   ```js
   const bidSuffix = isBid && bidId ? `?bidId=${bidId}&adt=${adt}&chd=${chd}&inf=${inf}` : '';
   apiFetch(`/flights/${flightId}${bidSuffix}`)
   ```
2. **Backend Controller Extraction**: Updated `FlightController.getById` to extract `adt`, `chd`, and `inf` and forward them parsed to `applyCheapBidById()`:
   ```typescript
   await this.flightService.applyCheapBidById(flight, Number(bidId), {
     adults: adt ? parseInt(adt, 10) : 1,
     children: chd ? parseInt(chd, 10) : 0,
     infants: inf ? parseInt(inf, 10) : 0,
   });
   ```
3. **Backend Service Recheck**: Updated `FlightService.applyCheapBidById` to check for inbound legs dynamically using `flight.inbound/inboundSegments` to determine `trip` type (`round-trip` vs. `one-way`) and use the correct passenger counts.
4. **Frontend Fallback Fix**: Updated `TripSummary.tsx` and `itinerary/page.tsx` to fall back to the original GDS rates (`origChd`/`origInf`) when `standbyDeal.bidChdPrice/bidInfPrice` is null:
   ```js
   const resolvedBidChdPrice = appliedMeta && appliedMeta.bidChdPrice !== undefined
     ? appliedMeta.bidChdPrice
     : (standbyDeal.bidChdPrice != null ? Number(standbyDeal.bidChdPrice) : Number(origChd ?? resolvedBidAdtPrice));
   ```

---

#### Files Changed

| File | What Changed |
|---|---|
| [`apps/frontend/app/flights/itinerary/page.tsx`](apps/frontend/app/flights/itinerary/page.tsx) | Passed passenger counts to flight details API, and corrected fallback calculation for `rawChd`/`rawInf` |
| [`apps/frontend/app/flights/booking/components/TripSummary.tsx`](apps/frontend/app/flights/booking/components/TripSummary.tsx) | Corrected fallback calculation for `resolvedBidChdPrice`/`resolvedBidInfPrice` |
| [`apps/backend/src/modules/flight/controllers/flight.controller.ts`](apps/backend/src/modules/flight/controllers/flight.controller.ts) | Parsed and forwarded passenger counts from query parameters to `applyCheapBidById` |
| [`apps/backend/src/modules/flight/services/flight.service.ts`](apps/backend/src/modules/flight/services/flight.service.ts) | Updated `applyCheapBidById` to dynamically check journey type and respect passenger counts |

---

### 🐛 Cheap Bid Passenger DB Fare Distorted by Ratio Scaling

**Date Fixed:** 2026-08-18  
**Symptoms:**
- User books a Cheap Bid flight (e.g. Adult `$199.00`, Child GDS fallback `$218.44`, Infant `$0.00`).
- The frontend displays the exact bid pricing correctly (e.g. Total approx `$437.34` including taxes/fees).
- In the MySQL CRM database `tbl_customer`, the individual passenger fares are unexpectedly scaled up (e.g. Adult `$208.49`, Child `$228.85`) instead of recording the exact `$199.00` and `$218.44`.

#### Root Cause

`ExternalFlightProvider.resolvePassengerCrmPricing` enforces total price scaling for standard GDS bookings so that the sum of passenger fares matches the final charged `totalAmount`. However, for Cheap Bid bookings, `FlightCrmBookingService` already overrides `flightSnapshot.flightFare` with the exact authorized absolute passenger fares (and live GDS fallbacks). Because the overall booking `totalAmount` may include taxes/fees (e.g. `$437.34`), applying proportional ratio scaling was corrupting the exact authorized unit fares (`$199.00` and `$218.44`).

#### The Fix

Updated `ExternalFlightProvider.resolvePassengerCrmPricing` to detect Cheap Bid bookings (`isCheapBidBooking`) via `paymentFlow === 'bid_deposit'`, `bidId`, or `cheapBidApplied`, and explicitly bypass the proportional ratio scaling. This guarantees that `tbl_customer` records the exact bid fares configured by the admin and verified by the backend.

#### Files Changed

| File | What Changed |
|---|---|
| [`apps/backend/src/common/providers/external-flight.provider.ts`](apps/backend/src/common/providers/external-flight.provider.ts) | Bypassed `totalAmount` ratio scaling for cheap bid bookings in `resolvePassengerCrmPricing` |

---

### 🐛 Cheap Bid Total Price Mismatch & Incorrect DB Saving

**Date Fixed:** 2026-08-18  
**Symptoms:**
- Frontend estimated total for Cheap Bid bookings was displaying incorrectly (e.g. `$199.00 USD` instead of `$199.00 (Adult) + $408.18 (Child) = $607.18 USD`).
- The database `tbl_customerdetails` saved the wrong total amount (the original GDS total, e.g. `$437.34` or `$607.18` instead of the exact sum of passenger bid fares).

#### Root Cause
1. **Frontend Estimated Total Bug**: `TripSummary.tsx` did not calculate the correct bid-based sum of all passenger fares when `isBid` was true. Additionally, its calculation parsed URL query parameters using `chd` and `children`, while the URL parameter was actually `chld` (causing the child passenger count to resolve to `0`).
2. **Standard GDS scaling logic in booking-fare**: `computeBookingFareTotals` was trying to scale GDS totals and taxes, which caused tax-inclusive prices to be used on the frontend instead of the exact bid fares sum with `tax = 0`.
3. **Backend Overwrite Bug**: In `FlightCrmBookingService`, the validation and safety check overwrote `dto.flightSnapshot.flightFare` but left `baseFare`, `tax`, `totalFare`, and `totalCost` as the original GDS total amounts. This resulted in the original GDS total being inserted into `tbl_customerdetails.total_amount` in the CRM database.
4. **Backend Select API Bug**: In `FlightService.selectFlightViaExternalApi`, cheap bid bookings resolved the standard (non-bid) cache flight and fell back to the upstream GDS total, returning GDS totals for itinerary page price verification.

#### The Fix
1. **Frontend Sum & Parameter Parsing Fix**: Updated `TripSummary.tsx` to calculate `effectiveGrandTotal` for bid bookings. It now correctly parses `chld` and `inf` parameters, sums the individual passenger bid fares (`adtCount * bidAdt + chdCount * bidChd + infCount * bidInf`), and overrides the displayed total, approx USD, and `targetTotal` passed to `PassengerFareBreakdown`.
2. **booking-fare isBid Bypass**: Updated `computeBookingFareTotals` in `booking-fare.ts` to accept `isBid` and calculate `baseFare = exact sum of passenger bid fares` and `tax = 0` whenever `isBid` is `true`. Passed `isBid` to all call sites in Next.js pages.
3. **Backend Snapshot Overwrite**: Updated `FlightCrmBookingService.submit` to explicitly overwrite `dto.flightSnapshot` total fields (`baseFare`, `tax`, `totalFare`, `totalCost`, `userBaseFare`, `userTax`, `userTotalFare`) with `expectedBidTotal` (sum of resolved passenger bid fares).
4. **Backend Select API Fix**: Updated `FlightService.selectFlightViaExternalApi` to calculate and return `resultTotal = sum of passenger bid fares`, `resultBase = sum of passenger bid fares`, and `resultTax = 0` for cheap bid synthetic/applied select calls.

#### Files Changed

| File | What Changed |
|---|---|
| [`apps/frontend/app/flights/booking/components/TripSummary.tsx`](apps/frontend/app/flights/booking/components/TripSummary.tsx) | Calculated correct sum of bid passenger fares for `effectiveGrandTotal` and fixed URL parameter parsing for children (`chld`) and infants (`inf`) |
| [`apps/frontend/lib/utils/booking-fare.ts`](apps/frontend/lib/utils/booking-fare.ts) | Bypassed GDS tax scaling in `computeBookingFareTotals` when `isBid` is true |
| [`apps/frontend/app/flights/booking/page.tsx`](apps/frontend/app/flights/booking/page.tsx) & `.mobile.tsx`, and `itinerary/page.tsx` & `.mobile.tsx` | Passed `isBid` flag to `computeBookingFareTotals` |
| [`apps/backend/src/modules/flight/services/flight.service.ts`](apps/backend/src/modules/flight/services/flight.service.ts) | Calculated and returned correct bid totals in `selectFlightViaExternalApi` |
| [`apps/backend/src/modules/flight/services/flight-crm-booking.service.ts`](apps/backend/src/modules/flight/services/flight-crm-booking.service.ts) | Overwrote booking snapshot totals with the correct sum of bid fares |
