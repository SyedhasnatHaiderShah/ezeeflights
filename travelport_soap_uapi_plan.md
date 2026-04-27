# Travelport SOAP uAPI Integration Plan

## 1. Understanding the Discrepancy

The documentation you have in `apps/backend/docs/flights` refers to Travelport's **JSON APIs (TripServices)**, which use REST and JSON. However, your current working implementation (`TravelportProvider`) uses the **Travelport Universal API (uAPI)**, which is based on SOAP and XML.

As a senior developer, my recommendation is to **stick with your existing SOAP uAPI implementation**. Your `LowFareSearchReq` is already working fine, and switching to the JSON API now would require rewriting everything from scratch. Instead, we can map the concepts from the REST docs to your existing SOAP structure to complete the workflow.

---

## 2. The Complete Flight Booking Flow (SOAP uAPI)

Here is the complete end-to-end flow you need to implement to successfully book and ticket a flight:

### Step 1: Flight Search (Already Completed ✅)
- **What it does:** Searches for available flights and prices.
- **SOAP Request:** `air:LowFareSearchReq` (AirService)
- **Current Status:** Implemented and working in `searchFlights`.

### Step 2: Air Pricing (Next Step 🔜)
- **What it does:** Before booking, you must confirm that the price hasn't changed and the seats are still available. This step is mandatory in Travelport.
- **SOAP Request:** `air:AirPriceReq` (AirService)
- **Current Status:** Partially implemented in `priceItinerary` inside `TravelportProvider`. We need to wire it up to your controllers.

### Step 3: Booking / PNR Creation
- **What it does:** Submits traveler details (Name, DOB, Passport) and the confirmed pricing solution to Travelport. This creates a Passenger Name Record (PNR) and a Universal Record (UR). **No money is charged yet.** The reservation is simply "held".
- **SOAP Request:** `universal:AirCreateReservationReq` (UniversalRecordService)
- **Current Status:** Partially implemented in `createReservation`.

### Step 4: Payment Processing
- **What it does:** You charge the customer using your payment gateway (e.g., Stripe, PayTabs, Tabby).
- **Current Status:** You have providers for these in `src/common/providers`.

### Step 5: Ticketing (Issuing the E-Ticket)
- **What it does:** Once payment is secured, you tell Travelport to issue the actual ticket. Without this, the PNR will expire and be cancelled.
- **SOAP Request:** `air:AirTicketingReq` (AirService)
- **Current Status:** Needs to be implemented.

---

## 3. Mapping the REST Docs to SOAP uAPI

If you are looking at your REST docs, here is how they translate to the SOAP APIs we will use:

| REST API Concept (Your Docs) | SOAP uAPI Equivalent (What we use) | Description |
|------------------------------|------------------------------------|-------------|
| `POST /air/catalog/search` | `air:LowFareSearchReq` | Flight Search |
| `POST /air/price/offers` | `air:AirPriceReq` | Confirm pricing and availability |
| `POST /air/book/reservation` | `universal:AirCreateReservationReq`| Create PNR and hold seats |
| `POST /air/ticket/tickets` | `air:AirTicketingReq` | Issue the e-ticket |

---

## 4. Guided Implementation Plan

To finish the flights module, we need to implement the following tasks in order:

### Phase 1: Expose the Air Pricing Endpoint
1. **Controller:** Create an endpoint `POST /flights/price`.
2. **Service:** Take the selected `FlightEntity` (from your cache or DB), extract its raw segments, and pass them to `travelportProvider.priceItinerary`.
3. **Outcome:** Return the final confirmed price to the frontend.

### Phase 2: Expose the Booking Endpoint (PNR Creation)
1. **Controller:** Create `POST /flights/book`.
2. **Service:** Accept traveler details (names, genders, DOBs).
3. **Action:** Pass the traveler details and the `AirPricingSolution` from Phase 1 to `travelportProvider.createReservation`.
4. **Outcome:** Travelport returns a PNR Locator Code (e.g., `X7B9PQ`). Save this in your database as a "Pending" booking.

### Phase 3: Payment Integration
1. After the PNR is created, trigger the payment flow (Stripe/PayTabs checkout).
2. The frontend redirects the user to pay.
3. Upon successful webhook callback, mark the booking as "Paid".

### Phase 4: Ticketing Integration
1. **Travelport Provider:** Implement `air:AirTicketingReq`.
2. **Action:** Once payment succeeds, automatically call this SOAP request with the PNR Locator Code.
3. **Outcome:** Travelport issues ticket numbers. Update your database and send a confirmation email to the user.

---

### How would you like to proceed?
I can start by implementing **Phase 1 (Air Pricing)** and **Phase 2 (Booking)** for you right now. Should I go ahead and update your `flight.controller.ts` and `flight.service.ts` to support these next steps?
