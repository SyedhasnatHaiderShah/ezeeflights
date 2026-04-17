import { Suspense } from "react";
import { Header } from "@/components/sections/Header";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { FlightSearchContainer } from "./FlightSearchContainer";
import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";
import flightDataJson from "@/flight-data.json";
import { StickySearchPanel } from "./StickySearchPanel";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function toFlightListItem(entity: any): FlightListItem {
  const depAt = entity.departureAt ? new Date(entity.departureAt).toISOString() : "";
  const arrAt = entity.arrivalAt ? new Date(entity.arrivalAt).toISOString() : "";
  const durationMins = Number(entity.duration ?? 0);
  const airlineName = String(entity.airline ?? "Unknown Airline");
  const airlineCode = String(entity.airlineCode ?? "XX");

  const segment = {
    departureDate: depAt,
    arrivalDate: arrAt,
    fromAirport: { id: 0, code: String(entity.departureAirport ?? ""), name: String(entity.departureAirport ?? ""), cityCode: String(entity.departureAirport ?? ""), cityName: String(entity.departureAirport ?? "") },
    toAirport: { id: 0, code: String(entity.arrivalAirport ?? ""), name: String(entity.arrivalAirport ?? ""), cityCode: String(entity.arrivalAirport ?? ""), cityName: String(entity.arrivalAirport ?? "") },
    airline: { id: 0, code: airlineCode, name: airlineName },
    operatingAirline: { id: 0, code: airlineCode, name: airlineName },
    flightNo: String(entity.flightNumber ?? ""),
    equipmentType: "Boeing 787",
    baggageAllowance: "23kg",
    elapsedTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
    totalTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
    cabinClass: String(entity.cabinClass ?? "ECONOMY"),
    isReturn: false,
  };

  const baseFare = Number(entity.baseFare ?? 0);
  const tax = Math.round(baseFare * 0.12 * 100) / 100;

  return { flightId: String(entity.id ?? ""), airline: { id: 0, code: airlineCode, name: airlineName }, currency: String(entity.currency ?? "USD"), totalTime: durationMins, totalCost: baseFare + tax, stops: Number(entity.stops ?? 0), outbound: [segment], inbound: [], flightFare: { adultFare: baseFare, adultTax: tax, grandTotal: baseFare + tax } };
}

function mapMockSegment(seg: any): FlightSegment {
  return {
    departureDate: seg.departureDate,
    arrivalDate: seg.arrivalDate,
    fromAirport: { id: seg.fromAirport?.id ?? 0, code: seg.fromAirport?.code ?? "", name: seg.fromAirport?.name ?? "", cityCode: seg.fromAirport?.cityCode ?? "", cityName: seg.fromAirport?.cityName ?? "" },
    toAirport: { id: seg.toAirport?.id ?? 0, code: seg.toAirport?.code ?? "", name: seg.toAirport?.name ?? "", cityCode: seg.toAirport?.cityCode ?? "", cityName: seg.toAirport?.cityName ?? "" },
    airline: { id: seg.airline?.id ?? 0, code: seg.airline?.code ?? "", name: seg.airline?.name ?? "" },
    operatingAirline: { id: seg.operatingAirline?.id ?? 0, code: seg.operatingAirline?.code ?? "", name: seg.operatingAirline?.name ?? "" },
    flightNo: seg.flightNo ?? "",
    equipmentType: seg.equipmentType ?? "",
    baggageAllowance: seg.baggageAllowance ?? "23kg",
    elapsedTime: seg.elapsedTime ?? "0h 0m",
    totalTime: seg.totalTime ?? "0h 0m",
    cabinClass: seg.cabinClass ?? "ECONOMY",
    isReturn: seg.isReturn ?? false,
  };
}

function getMockFlights(): FlightListItem[] {
  try {
    const flights = (flightDataJson as any).flightsList || [];
    return flights.map((flight: any): FlightListItem => ({
      flightId: flight.flightId,
      airline: flight.airline,
      currency: flight.currency,
      totalTime: flight.totalTime,
      totalCost: flight.totalCost,
      stops: flight.stops,
      outbound: (flight.outbound || []).map(mapMockSegment),
      inbound: (flight.inbound || []).map(mapMockSegment),
      flightFare: flight.flightFare,
    }));
  } catch {
    return [];
  }
}

async function fetchFlights(params: URLSearchParams): Promise<FlightListItem[]> {
  const apiBase = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/v1";

  try {
    const res = await fetch(`${apiBase}/flights/search?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return getMockFlights();
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return getMockFlights();
    return data.map(toFlightListItem);
  } catch {
    return getMockFlights();
  }
}

async function FlightResultsWrapper({ searchParams }: { searchParams: URLSearchParams }) {
  const flights = await fetchFlights(searchParams);
  return <FlightSearchContainer initialFlights={flights} />;
}

export default async function FlightResultsPage({ searchParams }: SearchProps) {
  const unwrappedParams = await searchParams;
  const origin = unwrappedParams.org ?? "LHE";
  const destination = unwrappedParams.des ?? "DXB";
  const departureDate = unwrappedParams.dDate ?? new Date().toISOString().slice(0, 10);
  const returnDate = unwrappedParams.rDate;
  const adt = unwrappedParams.adt ?? "1";
  const chd = unwrappedParams.chd ?? "0";
  const inf = unwrappedParams.inf ?? "0";
  const cabinClass = unwrappedParams.class ?? "Economy";
  const tripType = unwrappedParams.trip ?? "round-trip";

  const apiParams = new URLSearchParams({ origin, destination, departureDate, page: unwrappedParams.page ?? "1", limit: unwrappedParams.limit ?? "20" });
  if (cabinClass) apiParams.set("cabinClass", cabinClass.toUpperCase().replace(/ /g, "_"));

  return (
    <>
      <Header />
      <div className="h-20 w-full" />
      <div className="min-h-screen bg-slate-50 dark:bg-background pb-20">
        <StickySearchPanel
          origin={origin}
          destination={destination}
          departureDate={departureDate}
          passengers={`${adt} Adult`}
          cabinClass={cabinClass}
        />
        <Suspense fallback={<div className="max-w-[1240px] mx-auto px-4 py-8"><FlightResultSkeleton /></div>}>
          <FlightResultsWrapper searchParams={apiParams} />
        </Suspense>
      </div>
    </>
  );
}
