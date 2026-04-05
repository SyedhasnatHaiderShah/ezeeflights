export interface FlightEntity {
  id: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: Date;
  arrivalAt: Date;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  baseFare: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  seatsAvailable: number;
  createdAt: Date;
}
