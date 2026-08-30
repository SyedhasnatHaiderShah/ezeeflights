import { Suspense } from "react";
import { Header } from "@/components/sections/Header";
import { GlobalLoaderTrigger } from "@/components/shared/GlobalLoaderTrigger";
import { CarResultsContainer } from "@/components/cars/CarResultsContainer";
import { DestinationInsightsPrefetch } from "@/app/flights/result/DestinationInsightsPrefetch";
import { extractIataCodeFromLocation } from "@/lib/store/destination-insights-store";
import {
  parseCarSearchParams,
  toCarApiSearchParams,
} from "@/lib/utils/car-search-params";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

type TravelportCar = {
  id: string;
  name: string;
  acrissCode?: string;
  category: string;
  partnerNetwork: { name: string };
  pricePerDay: number;
  totalPrice?: number;
  currency: string;
  features: string[];
  unlimitedMileage: boolean;
  freeCancellation: boolean;
  location: string;
  description?: string;
  vendorLocationKey?: string | null;
  rateToken?: string | null;
  [key: string]: any;
};

async function fetchCars(params: URLSearchParams): Promise<{ cars: TravelportCar[]; error?: string }> {
  let apiBase =
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/api";

  if (!apiBase.endsWith("/api")) {
    apiBase = `${apiBase.replace(/\/$/, "")}/api`;
  }

  try {
    const url = `${apiBase}/cars/search?${params.toString()}`;
    console.log("[Cars] Fetching:", url);

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Cars] API error:", text);
      return { cars: [], error: `Search failed: ${response.status}` };
    }

    const data = await response.json();
    const cars = Array.isArray(data) ? data : data.data ?? [];
    console.log("[Cars] Found", cars.length, "cars");
    return { cars };
  } catch (err: any) {
    console.error("[Cars] Fetch error:", err.message);
    return { cars: [], error: err.message };
  }
}

async function CarResultsWrapper({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const { pickup, dropoff, pickupDate, dropoffDate } =
    parseCarSearchParams(searchParams);
  const apiParams = toCarApiSearchParams({
    pickup,
    dropoff,
    pickupDate,
    dropoffDate,
  });

  const { cars, error } = await fetchCars(apiParams);

  return (
    <CarResultsContainer
      initialCars={cars}
      error={error}
      pickupLocation={pickup}
      dropoffLocation={dropoff}
      pickupDate={pickupDate}
      dropoffDate={dropoffDate}
    />
  );
}

function CarResultsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header mock */}
      <div className="h-16 border-b border-border bg-card animate-pulse" />
      {/* Search Header mock */}
      <div className="h-28 bg-muted/20 border-b border-border/50 animate-pulse" />
      
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[240px_minmax(0,1fr)_380px] gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block space-y-4">
            <div className="h-6 w-24 bg-muted/50 rounded-md animate-pulse" />
            <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
          </div>
          
          {/* Main content */}
          <div className="space-y-4">
            <div className="h-12 bg-muted/30 rounded-2xl animate-pulse" />
            <div className="h-48 bg-muted/30 rounded-2xl animate-pulse" />
            <div className="h-48 bg-muted/30 rounded-2xl animate-pulse" />
            <div className="h-48 bg-muted/30 rounded-2xl animate-pulse" />
          </div>
          
          {/* Right Sidebar */}
          <div className="hidden md:block space-y-4 pl-4 border-l border-border/50">
            <div className="h-40 bg-muted/30 rounded-2xl animate-pulse" />
            <div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CarsResultPage({ searchParams }: SearchProps) {
  const unwrappedParams = await searchParams;

  const apiParams = new URLSearchParams();
  for (const [key, value] of Object.entries(unwrappedParams)) {
    if (value !== undefined) apiParams.set(key, value);
  }

  const { pickup } = parseCarSearchParams(apiParams);
  const pickupCode = extractIataCodeFromLocation(pickup);

  return (
    <>
      <GlobalLoaderTrigger message="Searching Cars..." />
      {pickupCode.length === 3 && (
        <DestinationInsightsPrefetch destination={pickupCode} />
      )}
      <Suspense fallback={<CarResultsSkeleton />}>
        <CarResultsWrapper searchParams={apiParams} />
      </Suspense>
    </>
  );
}
