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
  const rawSegments = Array.isArray(entity.rawSegments) ? entity.rawSegments : [];
  
  const mapSegment = (s: any) => {
    const durationMins = parseInt(s.FlightTime) || 0;
    return {
      departureDate: s.DepartureTime,
      arrivalDate: s.ArrivalTime,
      fromAirport: { id: 0, code: String(s.Origin || ""), name: String(s.Origin || ""), cityCode: String(s.Origin || ""), cityName: String(s.Origin || "") },
      toAirport: { id: 0, code: String(s.Destination || ""), name: String(s.Destination || ""), cityCode: String(s.Destination || ""), cityName: String(s.Destination || "") },
      airline: { id: 0, code: String(s.Carrier || ""), name: String(s.Carrier || "") },
      operatingAirline: { id: 0, code: String(s.Carrier || ""), name: String(s.Carrier || "") },
      flightNo: String(s.FlightNumber || ""),
      equipmentType: "Boeing 787",
      baggageAllowance: "23kg",
      elapsedTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      totalTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      cabinClass: String(entity.cabinClass ?? "ECONOMY"),
      isReturn: s.Group > 0,
    };
  };

  const outbound = rawSegments.filter((s: any) => s.Group === 0 || s.Group === '0' || !s.Group).map(mapSegment);
  const inbound = rawSegments.filter((s: any) => s.Group > 0 || s.Group === '1').map(mapSegment);

  // Fallback for one-way or missing group data
  if (outbound.length === 0 && rawSegments.length > 0) {
    outbound.push(...rawSegments.map(mapSegment));
  }

  const totalCost = Number(entity.totalFare ?? entity.price ?? 0);
  const baseFare = Number(entity.baseFare ?? 0);
  const tax = Number(entity.tax ?? 0);

  return {
    flightId: String(entity.id ?? ""),
    airline: { id: 0, code: String(entity.airlineCode || ""), name: String(entity.airline || "") },
    currency: String(entity.currency || "USD"),
    totalTime: Number(entity.duration || 0),
    totalCost,
    stops: Number(entity.stops || 0),
    outbound,
    inbound,
    flightFare: { adultFare: baseFare, adultTax: tax, grandTotal: totalCost }
  };
}

function mapMockSegment(seg: any): FlightSegment {
  return {
    departureDate: seg.departureDate,
    arrivalDate: seg.arrivalDate,
    fromAirport: {
      id: seg.fromAirport?.id ?? 0,
      code: seg.fromAirport?.code ?? "",
      name: seg.fromAirport?.name ?? "",
      cityCode: seg.fromAirport?.cityCode ?? "",
      cityName: seg.fromAirport?.cityName ?? "",
    },
    toAirport: {
      id: seg.toAirport?.id ?? 0,
      code: seg.toAirport?.code ?? "",
      name: seg.toAirport?.name ?? "",
      cityCode: seg.toAirport?.cityCode ?? "",
      cityName: seg.toAirport?.cityName ?? "",
    },
    airline: {
      id: seg.airline?.id ?? 0,
      code: seg.airline?.code ?? "",
      name: seg.airline?.name ?? "",
    },
    operatingAirline: {
      id: seg.operatingAirline?.id ?? 0,
      code: seg.operatingAirline?.code ?? "",
      name: seg.operatingAirline?.name ?? "",
    },
    flightNo: seg.flightNo ?? "",
    equipmentType: seg.equipmentType ?? "",
    baggageAllowance: seg.baggageAllowance ?? "23kg",
    elapsedTime: seg.elapsedTime ?? "0h 0m",
    totalTime: seg.totalTime ?? "0h 0m",
    cabinClass: seg.cabinClass ?? "ECONOMY",
    isReturn: seg.isReturn ?? false,
  };
}

function getMockFlights(origin?: string, destination?: string, date?: string): FlightListItem[] {
  try {
    const flights = (flightDataJson as any).flightsList || [];
    return flights.map(
      (flight: any): FlightListItem => {
        const item: FlightListItem = {
          flightId: flight.flightId,
          airline: flight.airline,
          currency: flight.currency,
          totalTime: flight.totalTime,
          totalCost: flight.totalCost,
          stops: flight.stops,
          outbound: (flight.outbound || []).map((seg: any) => {
            const mapped = mapMockSegment(seg);
            if (origin) {
              mapped.fromAirport.code = origin;
              mapped.fromAirport.cityName = origin;
            }
            if (destination) {
              mapped.toAirport.code = destination;
              mapped.toAirport.cityName = destination;
            }
            if (date) {
              mapped.departureDate = date + mapped.departureDate.substring(10);
            }
            return mapped;
          }),
          inbound: (flight.inbound || []).map((seg: any) => {
            const mapped = mapMockSegment(seg);
            if (destination) {
              mapped.fromAirport.code = destination;
              mapped.fromAirport.cityName = destination;
            }
            if (origin) {
              mapped.toAirport.code = origin;
              mapped.toAirport.cityName = origin;
            }
            return mapped;
          }),
          flightFare: flight.flightFare,
        };
        return item;
      }
    );
  } catch {
    return [];
  }
}

async function fetchFlights(
  params: URLSearchParams,
): Promise<FlightListItem[]> {
  const apiBase =
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/v1";

  const origin = params.get("origin") || undefined;
  const destination = params.get("destination") || undefined;
  const date = params.get("departureDate") || undefined;

  try {
    const res = await fetch(`${apiBase}/flights/search?${params.toString()}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      console.warn(`Flight search API failed with status ${res.status}. Falling back to demo data.`);
      return getMockFlights(origin, destination, date);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log("No flights found from API. Falling back to demo data for current route.");
      return getMockFlights(origin, destination, date);
    }
    
    return data.map(toFlightListItem);
  } catch (err) {
    console.error("Flight search fetch error:", err);
    return getMockFlights(origin, destination, date);
  }
}

async function FlightResultsWrapper({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const flights = await fetchFlights(searchParams);
  return <FlightSearchContainer initialFlights={flights} />;
}

export default async function FlightResultsPage({ searchParams }: SearchProps) {
  const unwrappedParams = await searchParams;
  const origin = unwrappedParams.org ?? "LHE";
  const destination = unwrappedParams.des ?? "DXB";
  const departureDate =
    unwrappedParams.dDate ?? new Date().toISOString().slice(0, 10);
  const returnDate = unwrappedParams.rDate;
  const adt = unwrappedParams.adt ?? "1";
  const chd = unwrappedParams.chd ?? "0";
  const inf = unwrappedParams.inf ?? "0";
  const cabinClass = unwrappedParams.class ?? "Economy";
  const tripType = unwrappedParams.trip ?? "round-trip";

  const apiParams = new URLSearchParams({
    origin,
    destination,
    departureDate,
    adults: adt,
    children: chd,
    infants: inf,
    page: unwrappedParams.page ?? "1",
    limit: unwrappedParams.limit ?? "20",
  });

  if (returnDate) apiParams.set("returnDate", returnDate);
  if (cabinClass)
    apiParams.set("cabinClass", cabinClass.toUpperCase().replace(/ /g, "_"));

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
        <Suspense
          fallback={
            <div className="max-w-[1240px] mx-auto px-4 py-8">
              <FlightResultSkeleton />
            </div>
          }
        >
          <FlightResultsWrapper searchParams={apiParams} />
        </Suspense>
      </div>
    </>
  );
}
