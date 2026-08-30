import { Suspense } from "react";
import { Header } from "@/components/sections/Header";
import { GlobalLoaderTrigger } from "@/components/shared/GlobalLoaderTrigger";
import { HotelResultsContainer } from "@/components/hotels/HotelResultsContainer";
import { DestinationInsightsPrefetch } from "@/app/flights/result/DestinationInsightsPrefetch";
import { extractIataCodeFromLocation } from "@/lib/store/destination-insights-store";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function fetchHotels(params: URLSearchParams) {
  let apiBase =
    process.env.INTERNAL_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:4000/api";

  if (!apiBase.endsWith("/api")) {
    apiBase = `${apiBase.replace(/\/$/, "")}/api`;
  }

  try {
    const url = `${apiBase}/hotels/search?${params.toString()}`;
    console.log("[Hotels] Fetching:", url);

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Hotels] API error:", text);
      return { hotels: [], error: `Search failed: ${response.status}` };
    }

    const data = await response.json();
    const hotels = Array.isArray(data) ? data : data.data ?? [];
    console.log("[Hotels] Found", hotels.length, "hotels");
    return { hotels };
  } catch (err: any) {
    console.error("[Hotels] Fetch error:", err.message);
    return { hotels: [], error: err.message };
  }
}

async function HotelResultsWrapper({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const { hotels, error } = await fetchHotels(searchParams);
  const location = searchParams.get("city") || searchParams.get("location") || "";
  const checkIn = searchParams.get("checkInDate") || searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOutDate") || searchParams.get("checkOut") || "";

  return (
    <HotelResultsContainer
      initialHotels={hotels}
      error={error}
      location={location}
      checkIn={checkIn}
      checkOut={checkOut}
    />
  );
}

function HotelResultsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header mock */}
      <div className="h-16 border-b border-border bg-card animate-pulse" />
      {/* Search Header mock */}
      <div className="h-32 bg-slate-50/50 dark:bg-slate-900/20 border-b border-border/50 animate-pulse" />
      
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

export default async function HotelSearchPage({ searchParams }: SearchProps) {
  const unwrappedParams = await searchParams;

  const apiParams = new URLSearchParams();
  for (const [key, value] of Object.entries(unwrappedParams)) {
    if (value !== undefined) apiParams.set(key, value);
  }

  // Next.js components might send `location`, `checkIn`, `checkOut` instead of backend-compatible `city`, `checkInDate`, `checkOutDate`. 
  // Let's normalize it to match backend SearchHotelsDto.
  if (apiParams.has("location") && !apiParams.has("city")) {
    apiParams.set("city", apiParams.get("location")!);
  }
  if (apiParams.has("checkIn") && !apiParams.has("checkInDate")) {
    apiParams.set("checkInDate", apiParams.get("checkIn")!);
  }
  if (apiParams.has("checkOut") && !apiParams.has("checkOutDate")) {
    apiParams.set("checkOutDate", apiParams.get("checkOut")!);
  }

  const location = apiParams.get("city") || "";
  const locationCode = extractIataCodeFromLocation(location);

  return (
    <>
      <GlobalLoaderTrigger message="Searching Hotels..." />
      {locationCode.length === 3 && (
        <DestinationInsightsPrefetch destination={locationCode} />
      )}
      <Suspense fallback={<HotelResultsSkeleton />}>
        <HotelResultsWrapper searchParams={apiParams} />
      </Suspense>
    </>
  );
}
