export interface AdOfferEntity {
  id: string;               // UUID
  flightId: string;         // references flights.id (your live result)
  partnerCode: string;      // 'SELF' | 'KIWI' | 'WEGO' | 'AVIASALES'
  partnerName: string;      // Display name e.g. "Booking.com Flights"
  partnerLogoUrl?: string;

  origin: string;           // IATA
  destination: string;
  departureAt: Date;
  arrivalAt: Date;
  airline: string;
  flightNumber: string;
  stops: number;

  displayPrice: number;     // The discounted teaser price shown to the user
  originalPrice: number;    // Your Travelport price (hidden from UI)
  discountPct: number;      // 0.10 = 10%
  currency: string;

  deepLinkUrl: string;      // Affiliate URL with UTM params
  trackingClickUrl: string; // Your own /flights/ads/click/:id URL

  // Deep-link tracking params (mirrors FlightSearchModel)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  refCode?: string;         // Your affiliate reference code
  tCode?: string;           // Transaction / tracking code from partner

  cabinClass: string;
  expiresAt: Date;          // TTL same as your Travelport session (30 min)
  createdAt: Date;
}
