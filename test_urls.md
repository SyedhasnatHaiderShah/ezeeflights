# Comprehensive Local Test URLs for Multi-Domain Verification

This document provides a complete set of local test links to verify currency locking, language settings, and CRM database logging (`worldrix_ezeecrm.click_detail`) for each regional domain.

> [!NOTE]
> Since we implemented **session storage persistence**, clicking any link below locks your local browser tab to that domain's environment for the entire flow (Home $\to$ Search $\to$ Itinerary $\to$ Booking $\to$ Confirmation). To switch domains, simply click another domain's link or close/re-open the tab.

---

## 1. Global / United States Domain (`ezeeflights.com`)
* **Expected Currency**: User's detected Geo-IP currency (e.g. `PKR / Rs`) highlighted, with `approx. $ ... USD` sub-text.
* **Language & Switchers**: Fully unlocked.
* **Home Page**:
  [http://localhost:3000/?test_host=ezeeflights.com](http://localhost:3000/?test_host=ezeeflights.com)
* **Search Results Page**:
  [http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=ezeeflights.com](http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=ezeeflights.com)
* **Itinerary Page (CRM Save Test)**:
  [http://localhost:3000/flights/itinerary?utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=ezeeflights.com](http://localhost:3000/flights/itinerary?utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=ezeeflights.com)

---

## 2. United Kingdom Domain (`uk.ezeeflights.com`)
* **Expected Currency**: **GBP (£)** natively. No `approx.` secondary currency lines shown.
* **Language & Switchers**: Currency switcher is hidden.
* **Home Page**:
  [http://localhost:3000/?test_host=uk.ezeeflights.com](http://localhost:3000/?test_host=uk.ezeeflights.com)
* **Search Results Page**:
  [http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=uk.ezeeflights.com](http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=uk.ezeeflights.com)
* **Itinerary Page (CRM Save Test)**:
  [http://localhost:3000/flights/itinerary?utm_source=JetCost-UK-FSR&utm_medium=cpc&utm_campaign=flight-search-deeplink&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=uk.ezeeflights.com](http://localhost:3000/flights/itinerary?utm_source=JetCost-UK-FSR&utm_medium=cpc&utm_campaign=flight-search-deeplink&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=uk.ezeeflights.com)

---

## 3. Canada Domain (`ezeeflights.ca`)
* **Expected Currency**: **CAD (C$)** natively. No `approx.` secondary currency lines.
* **Language & Switchers**: Currency switcher is hidden.
* **Home Page**:
  [http://localhost:3000/?test_host=ezeeflights.ca](http://localhost:3000/?test_host=ezeeflights.ca)
* **Search Results Page**:
  [http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=ezeeflights.ca](http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=ezeeflights.ca)
* **Itinerary Page (CRM Save Test)**:
  [http://localhost:3000/flights/itinerary?utm_source=farescraper&utm_medium=cpc&utm_campaign=flight-search-deeplink&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=ezeeflights.ca](http://localhost:3000/flights/itinerary?utm_source=farescraper&utm_medium=cpc&utm_campaign=flight-search-deeplink&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=ezeeflights.ca)

---

## 4. United Arab Emirates Domain (`ezeeflights.ae`)
* **Expected Currency**: **AED (dhs)** natively. No `approx.` secondary currency lines.
* **Language & Switchers**: Currency switcher is hidden.
* **Home Page**:
  [http://localhost:3000/?test_host=ezeeflights.ae](http://localhost:3000/?test_host=ezeeflights.ae)
* **Search Results Page**:
  [http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=ezeeflights.ae](http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=ezeeflights.ae)
* **Itinerary Page (CRM Save Test)**:
  [http://localhost:3000/flights/itinerary?utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=ezeeflights.ae](http://localhost:3000/flights/itinerary?utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=ezeeflights.ae)

---

## 5. Turkey Domain (`tr.ezeeflights.com`)
* **Expected Currency**: **TRY (TL)** natively. No `approx.` secondary currency lines.
* **Language & Switchers**: Locked to **Türkçe** (Language selector disabled). Currency switcher is hidden.
* **Home Page**:
  [http://localhost:3000/?test_host=tr.ezeeflights.com](http://localhost:3000/?test_host=tr.ezeeflights.com)
* **Search Results Page**:
  [http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=tr.ezeeflights.com](http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=tr.ezeeflights.com)
* **Itinerary Page (CRM Save Test)**:
  [http://localhost:3000/flights/itinerary?utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=tr.ezeeflights.com](http://localhost:3000/flights/itinerary?utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=tr.ezeeflights.com)

---

## 6. India Domain (`in.ezeeflights.com`)
* **Expected Currency**: **INR (₹)** natively. No `approx.` secondary currency lines.
* **Language & Switchers**: Currency switcher is hidden.
* **Home Page**:
  [http://localhost:3000/?test_host=in.ezeeflights.com](http://localhost:3000/?test_host=in.ezeeflights.com)
* **Search Results Page**:
  [http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=in.ezeeflights.com](http://localhost:3000/flights/result?org=LHE&des=DXB&dDate=2026-09-25&adt=1&chd=0&inf=0&class=all&prefClass=Economy&trip=one-way&utm_source=web&utm_medium=ezeeflights&utm_campaign=flight-search&loading=false&test_host=in.ezeeflights.com)
* **Itinerary Page (CRM Save Test)**:
  [http://localhost:3000/flights/itinerary?utm_source=JetCost&utm_medium=cpc&utm_campaign=flight-search-deeplink&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=in.ezeeflights.com](http://localhost:3000/flights/itinerary?utm_source=JetCost&utm_medium=cpc&utm_campaign=flight-search-deeplink&org=LHE&des=DXB&dDate=2026-09-25&adt=1&chld=0&inf=0&cabin=ECONOMY&searchId=be118d34-22e6-4f1f-91d5-09d500586091&tranId=0609fcee-952c-4a7e-b5be-b11844061c58&test_host=in.ezeeflights.com)
