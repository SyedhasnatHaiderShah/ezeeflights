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
  baseFare: number;
  tax?: number;
  totalFare?: number;
  currency: "USD" | "AED" | "EUR" | "GBP" | "INR" | string;
  seatsAvailable: number;
  createdAt: Date;
  rawSegments?: any;
}
