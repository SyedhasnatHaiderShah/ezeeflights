export interface Airport {
  id: number;
  code: string;
  name: string;
  cityCode: string;
  cityName: string;
}

export interface Airline {
  id: number;
  code: string | null;
  name: string | null;
}

export interface FlightSegment {
  departureDate: string;
  arrivalDate: string;
  fromAirport: Airport;
  toAirport: Airport;
  airline: Airline;
  operatingAirline: Airline;
  flightNo: string;
  equipmentType: string;
  baggageAllowance: string;
  elapsedTime: string;
  totalTime: string;
  cabinClass: string;
  isReturn: boolean;
}

export interface FlightListItem {
  flightId: string;
  airline: Airline;
  currency: string;
  totalTime: number;
  totalCost: number;
  stops: number;
  outbound: FlightSegment[];
  inbound: FlightSegment[];
  flightFare: {
    adultFare: number;
    adultTax: number;
    grandTotal: number;
  };
}

export interface FlightSearchRQ {
  from: string;
  to: string;
  depDate: string;
  retDate: string;
  adult: number;
  child: number;
  infant: number;
  flightWay: number;
  flightClass: number;
  currency: string;
}

export interface FlightSearchResponse {
  error: string | null;
  minPrice: number;
  maxPrice: number;
  flightsSearchRQ: FlightSearchRQ;
  flightsList: FlightListItem[];
}
