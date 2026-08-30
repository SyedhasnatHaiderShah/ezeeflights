import { Suspense } from "react";
import { searchHotels } from "@/lib/api/hotels";
import { Header } from "@/components/sections/Header";
import { HotelResultsContent } from "./HotelResultsContent";
import { HotelStickySearchPanel } from "./HotelStickySearchPanel";
import { GlobalLoaderTrigger } from "@/components/shared/GlobalLoaderTrigger";
import { HotelResultSkeleton } from "@/components/hotels/HotelCardSkeleton";

export const dynamic = "force-dynamic"; // @capacitor-dynamic-override @capacitor-build-toggle

interface PageParams {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: string;
  rooms?: string;
  page?: string;
  limit?: string;
}

async function HotelResultsWrapper({
  searchParams,
  city,
  checkInDate,
  checkOutDate,
  adults,
  rooms,
  queryStr,
}: {
  searchParams: PageParams;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  adults: string;
  rooms: string;
  queryStr: string;
}) {
  let result;
  try {
    result = await searchHotels({
      city,
      checkInDate,
      checkOutDate,
      adults,
      rooms,
      page: searchParams.page ?? "1",
      limit: searchParams.limit ?? "10",
    });
  } catch (e) {
    console.error("Hotel search failed:", e);
    result = { data: [], total: 0 };
  }

  return (
    <HotelResultsContent
      initialData={result.data || []}
      city={city}
      checkInDate={checkInDate}
      checkOutDate={checkOutDate}
      query={queryStr}
      totalCount={result.total || 0}
      currentPage={Number(searchParams.page ?? "1")}
      limit={Number(searchParams.limit ?? "10")}
    />
  );
}

export default async function HotelResultsPage({
  searchParams,
}: {
  searchParams: Promise<PageParams>;
}) {
  const params = await searchParams;
  console.log("HotelResultsPage: Executing with params:", params);
  const city = params.city ?? "";
  const checkInDate = params.checkInDate ?? "";
  let checkOutDate = params.checkOutDate ?? "";

  if (checkInDate && checkOutDate) {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    if (outDate <= inDate) {
      const nextDay = new Date(inDate);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutDate = nextDay.toISOString().split("T")[0];
    }
  }

  const adults = params.adults ?? "2";
  const rooms = params.rooms ?? "1";

  const queryStr = new URLSearchParams({
    city,
    checkInDate,
    checkOutDate,
    adults,
    rooms,
    page: params.page ?? "1",
    limit: params.limit ?? "10",
  }).toString();

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden max-md:h-auto max-md:overflow-y-auto">
      <Header />
      <HotelStickySearchPanel
        city={city}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        adults={adults}
        rooms={rooms}
        query={queryStr}
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 mt-12 pt-6 pb-0 flex-1 min-h-0 overflow-hidden max-md:overflow-visible max-md:h-auto">
        <GlobalLoaderTrigger message="Searching hotels..." />
        <Suspense fallback={<HotelResultSkeleton />}>
          <HotelResultsWrapper
            searchParams={params}
            city={city}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            adults={adults}
            rooms={rooms}
            queryStr={queryStr}
          />
        </Suspense>
      </div>
    </div>
  );
}
