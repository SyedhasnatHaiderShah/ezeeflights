export interface MockFlight {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  departureAt: string;
  arrivalAt: string;
  duration: string;
  stops: number;
  baseFare: number;
  totalFare: number;
  currency: string;
  cabinClass: string;
}

export const MOCK_FLIGHTS: MockFlight[] = [
  {
    id: "f1",
    airline: "Etihad Airways",
    airlineCode: "EY",
    airlineLogo: "https://www.kayak.com/rimg/provider-logos/airlines/v/EY.png",
    flightNumber: "EY242",
    departureAirport: "LHE",
    arrivalAirport: "AUH",
    departureTime: "4:40 am",
    arrivalTime: "7:00 am",
    departureAt: "2026-04-29T04:40:00Z",
    arrivalAt: "2026-04-29T07:00:00Z",
    duration: "3h 20m",
    stops: 0,
    baseFare: 570,
    totalFare: 2279,
    currency: "$",
    cabinClass: "Economy Basic",
  },
  {
    id: "f2",
    airline: "SAUDIA",
    airlineCode: "SV",
    airlineLogo: "https://www.kayak.com/rimg/provider-logos/airlines/v/SV.png",
    flightNumber: "SV735",
    departureAirport: "LHE",
    arrivalAirport: "JED",
    departureTime: "6:05 pm",
    arrivalTime: "3:25 pm",
    departureAt: "2026-04-29T18:05:00Z",
    arrivalAt: "2026-04-30T15:25:00Z",
    duration: "22h 20m",
    stops: 1,
    baseFare: 465,
    totalFare: 1859,
    currency: "$",
    cabinClass: "Economy Basic",
  },
  {
    id: "f3",
    airline: "Fly Emirates",
    airlineCode: "EK",
    airlineLogo: "https://www.kayak.com/rimg/provider-logos/airlines/v/EK.png",
    flightNumber: "EK623",
    departureAirport: "LHE",
    arrivalAirport: "DXB",
    departureTime: "3:20 am",
    arrivalTime: "5:40 am",
    departureAt: "2026-04-29T03:20:00Z",
    arrivalAt: "2026-04-29T05:40:00Z",
    duration: "3h 20m",
    stops: 0,
    baseFare: 620,
    totalFare: 2480,
    currency: "$",
    cabinClass: "Economy",
  },
  {
    id: "f4",
    airline: "Qatar Airways",
    airlineCode: "QR",
    airlineLogo: "https://www.kayak.com/rimg/provider-logos/airlines/v/QR.png",
    flightNumber: "QR621",
    departureAirport: "LHE",
    arrivalAirport: "DOH",
    departureTime: "9:15 am",
    arrivalTime: "11:30 am",
    departureAt: "2026-04-29T09:15:00Z",
    arrivalAt: "2026-04-29T11:30:00Z",
    duration: "3h 15m",
    stops: 0,
    baseFare: 590,
    totalFare: 2360,
    currency: "$",
    cabinClass: "Economy",
  }
];
