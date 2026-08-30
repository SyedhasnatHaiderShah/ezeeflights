import { CheapBidAppliedMeta } from "../../cheap-bid/entities/cheap-bid.entity";

export interface FlightEntity {
  id: string;
  flightId: string; // Alias for frontend compatibility
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: Date;
  arrivalAt: Date;
  duration: number;
  stops: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  /** Cabins returned by Travelport for this itinerary (may be a subset of all classes). */
  availableCabinClasses?: Array<
    'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  >;
  /** All monetary values below are stored in USD (converted from sourceCurrency). */
  baseFare: number;
  tax?: number;
  totalFare?: number;
  currency: "USD" | "AED" | "EUR" | "GBP" | "INR" | string;
  /** Original currency returned by Travelport (e.g. INR for India PCC). */
  sourceCurrency?: string;
  /** Original base fare in sourceCurrency before USD conversion. */
  sourceBaseFare?: number;
  /** Original tax in sourceCurrency before USD conversion. */
  sourceTax?: number;
  /** Original total fare in sourceCurrency before USD conversion. */
  sourceTotalFare?: number;
  seatsAvailable: number;
  createdAt: Date;
  baggageAllowance?: string;
  rawSegments?: any;
  outboundSegments?: any[];
  inboundSegments?: any[];
  flightFare?: any;
  rawFlight?: any;
  /** User search destination (e.g. DXB) when provider uses a ground code (e.g. XNB). */
  searchedDestination?: string;
  /** Set when a Spanish Jetcost / usa_table markup rule is applied at search time. */
  markupApplied?: {
    ruleId: number;
    markupType: string;
    adultAmount: number;
    childAmount: number;
    infantAmount: number;
  };
  /** Set when an admin cheap-bid offer is applied at search time. */
  cheapBidApplied?: CheapBidAppliedMeta;
  sessionId?: string;
  searchId?: string;
}
