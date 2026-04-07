export interface FlightEntity {
  id: string;
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
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  seatsAvailable: number;
  createdAt: Date;
}
