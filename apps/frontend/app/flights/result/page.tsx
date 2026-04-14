import { ResultSearchHeader } from "./ResultSearchHeader";
import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";
import { Header } from "@/components/sections/Header";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import {
  GeminiRecommendations,
  GeminiSkeleton,
} from "@/components/ai/GeminiRecommendations";
import { FloatingSearchButton } from "@/components/search/FloatingSearchButton";
import { FlightSearchContainer } from "./FlightSearchContainer";
import { FlightListItem } from "@/lib/types/flight-api";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

/** Map backend FlightEntity shape to the FlightListItem shape the UI expects. */
function toFlightListItem(entity: any): FlightListItem {
  const depAt = entity.departureAt ? new Date(entity.departureAt).toISOString() : "";
  const arrAt = entity.arrivalAt ? new Date(entity.arrivalAt).toISOString() : "";
  const durationMins = Number(entity.duration ?? 0);
  const airlineName = String(entity.airline ?? "Unknown Airline");
  const airlineCode = String(entity.airlineCode ?? "XX");

  const segment = {
    departureDate: depAt,
    arrivalDate: arrAt,
    fromAirport: {
      id: 0,
      code: String(entity.departureAirport ?? ""),
      name: String(entity.departureAirport ?? ""),
      cityCode: String(entity.departureAirport ?? ""),
      cityName: String(entity.departureAirport ?? ""),
    },
    toAirport: {
      id: 0,
      code: String(entity.arrivalAirport ?? ""),
      name: String(entity.arrivalAirport ?? ""),
      cityCode: String(entity.arrivalAirport ?? ""),
      cityName: String(entity.arrivalAirport ?? ""),
    },
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

  return {
    flightId: String(entity.id ?? ""),
    airline: { id: 0, code: airlineCode, name: airlineName },
    currency: String(entity.currency ?? "USD"),
    totalTime: durationMins,
    totalCost: baseFare + tax,
    stops: Number(entity.stops ?? 0),
    outbound: [segment],
    inbound: [],
    flightFare: {
      adultFare: baseFare,
      adultTax: tax,
      grandTotal: baseFare + tax,
    },
  };
}

async function fetchFlights(params: URLSearchParams): Promise<FlightListItem[]> {
  const apiBase =
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/v1";

  try {
    const url = `${apiBase}/flights/search?${params.toString()}`;
    console.log(`📡 Fetching flights from: ${url}`);
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      console.error(`❌ Flight search failed: ${res.status} ${res.statusText}`, errorBody);
      return [];
    }
    
    const data = await res.json();
    console.log(`✅ Received ${Array.isArray(data) ? data.length : 0} flights from backend`);
    
    return Array.isArray(data) ? data.map(toFlightListItem) : [];
  } catch (error) {
    console.error("🚨 Error fetching flights:", error);
    return [];
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
    page: unwrappedParams.page ?? "1",
    limit: unwrappedParams.limit ?? "20",
  });

  if (cabinClass) apiParams.set("cabinClass", cabinClass.toUpperCase().replace(/ /g, "_"));

  const query = new URLSearchParams({
    origin,
    destination,
    departureDate,
    ...(returnDate && { returnDate }),
    adt,
    chd,
    inf,
    class: cabinClass,
    trip: tripType,
    page: unwrappedParams.page ?? "1",
    limit: unwrappedParams.limit ?? "20",
  });

  const searchHeaderBlock = (
    <Suspense
      fallback={
        <div className="h-[72px] bg-white dark:bg-background border-b dark:border-border" />
      }
    >
      <ResultSearchHeader
        initialOrigin={origin}
        initialDestination={destination}
        initialDDate={departureDate}
        initialRDate={returnDate}
        initialAdt={parseInt(adt)}
        initialChd={parseInt(chd)}
        initialInf={parseInt(inf)}
        initialClass={cabinClass}
        initialTripType={tripType}
      />
    </Suspense>
  );

  return (
    <>
      <Header />
      <div className="h-20 w-full" /> {/* Spacer for the fixed header height */}
      <div className="min-h-screen bg-slate-50 dark:bg-background relative pb-20 transition-colors duration-300">
        {/* Static search header visible at the top of the page */}
        <div className="relative z-10">{searchHeaderBlock}</div>

        <Suspense fallback={
          <div className="max-w-[1240px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-5">
            {/* Sidebar Placeholder */}
            <div className="w-full lg:w-64 flex-shrink-0 space-y-3 hidden lg:block">
              <div className="h-40 bg-white dark:bg-muted/10 rounded-xl animate-pulse" />
              <div className="h-60 bg-white dark:bg-muted/10 rounded-xl animate-pulse" />
            </div>
            {/* Results Skeleton */}
            <div className="flex-1">
              <FlightResultSkeleton />
            </div>
          </div>
        }>
          <FlightResultsWrapper searchParams={apiParams} />
        </Suspense>

        <div className="max-w-[1240px] mx-auto px-4">
          <main className="flex-1 space-y-4">
            {/* AI Travel Intelligence Section */}
            <div className="pt-12 border-t border-gray-200 dark:border-border mt-12 pb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-xl bg-brand-dark text-white shadow-lg shadow-brand-dark/10">
                  <Sparkles className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-brand-dark tracking-tight">
                    Aero Intelligence
                  </h2>
                  <p className="text-xs font-bold text-brand-dark-light/40 uppercase tracking-widest mt-1">
                    AI-powered travel insights for tactical discovery
                  </p>
                </div>
              </div>

              <Suspense fallback={<GeminiSkeleton />}>
                <GeminiRecommendations
                  destinationCode={destination}
                  searchParamsString={query.toString()}
                />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
      <FloatingSearchButton />
    </>
  );
}
