import { Suspense } from "react";
import { Header } from "@/components/sections/Header";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { FlightSearchContainer } from "./FlightSearchContainer";
import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";
import { StickySearchPanel } from "./StickySearchPanel";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function toFlightListItem(entity: any): FlightListItem {
  const rawSegments = Array.isArray(entity.segments)
    ? entity.segments
    : Array.isArray(entity.rawSegments)
      ? entity.rawSegments
      : [];

  const mapSegment = (s: any) => {
    const durationMins = parseInt(s.FlightTime) || 0;
    return {
      departureDate: s.DepartureTime,
      arrivalDate: s.ArrivalTime,
      fromAirport: {
        id: 0,
        code: String(s.Origin || ""),
        name: String(s.Origin || ""),
        cityCode: String(s.Origin || ""),
        cityName: String(s.Origin || ""),
      },
      toAirport: {
        id: 0,
        code: String(s.Destination || ""),
        name: String(s.Destination || ""),
        cityCode: String(s.Destination || ""),
        cityName: String(s.Destination || ""),
      },
      airline: {
        id: 0,
        code: String(s.Carrier || ""),
        name: String(s.Carrier || ""),
      },
      operatingAirline: {
        id: 0,
        code: String(s.Carrier || ""),
        name: String(s.Carrier || ""),
      },
      flightNo: String(s.FlightNumber || ""),
      equipmentType: String(s.Equipment || "Boeing 787"),
      baggageAllowance: s.BaggageAllowance || "23kg",
      elapsedTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      totalTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
      cabinClass: String(entity.cabinClass ?? "ECONOMY"),
      isReturn: s.Group > 0 || s.Group === "1",
    };
  };

  const outbound = rawSegments
    .filter((s: any) => s.Group === 0 || s.Group === "0" || !s.Group)
    .map(mapSegment);
  const inbound = rawSegments
    .filter((s: any) => s.Group > 0 || s.Group === "1")
    .map(mapSegment);

  // Fallback for one-way or missing group data
  if (outbound.length === 0 && rawSegments.length > 0) {
    outbound.push(...rawSegments.map(mapSegment));
  }

  const baseFare = Number(entity.baseFare ?? 0);
  const tax = Number(entity.tax ?? 0);
  const totalCost = Number(entity.totalFare ?? baseFare + tax);

  return {
    flightId: String(entity.id ?? ""),
    airline: {
      id: 0,
      code: String(entity.airlineCode || ""),
      name: String(entity.airline || ""),
    },
    currency: String(entity.currency || "USD"),
    totalTime: Number(entity.duration || 0),
    totalCost: totalCost,
    stops: Number(entity.stops || 0),
    outbound,
    inbound,
    flightFare: { adultFare: baseFare, adultTax: tax, grandTotal: totalCost },
  };
}

async function fetchFlights(
  params: URLSearchParams,
): Promise<FlightListItem[]> {
  const apiBase =
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/v1";

  try {
    const response = await fetch(
      `${apiBase}/flights/search?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Flight API failed:", await response.text());
      return [];
    }

    const data = await response.json();

    // The backend returns an array directly, or sometimes a wrapped object { success: true, data: [...] }
    const flightsArray = Array.isArray(data)
      ? data
      : data.success && Array.isArray(data.data)
        ? data.data
        : null;

    if (!flightsArray) {
      console.error("Invalid API response format:", data);
      return [];
    }

    return flightsArray.map(toFlightListItem);
  } catch (error) {
    console.error("Search error:", error);
    return [];
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
