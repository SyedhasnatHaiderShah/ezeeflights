import { searchHotels } from "@/lib/api/hotels";
import { Header } from "@/components/sections/Header";
import { HotelResultsContent } from "./HotelResultsContent";
import { HotelStickySearchPanel } from "./HotelStickySearchPanel";

export default async function HotelResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    city?: string;
    checkInDate?: string;
    checkOutDate?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const params = await searchParams;
  const city = params.city ?? "";
  const checkInDate = params.checkInDate ?? "";
  const checkOutDate = params.checkOutDate ?? "";

  let result;
  try {
    result = await searchHotels({
      city,
      checkInDate,
      checkOutDate,
      page: params.page ?? "1",
      limit: params.limit ?? "12",
    });
  } catch (e) {
    console.error("Hotel search failed:", e);
    result = { data: [] };
  }

  const queryStr = new URLSearchParams({
    city,
    checkInDate,
    checkOutDate,
    page: params.page ?? "1",
    limit: params.limit ?? "12",
  }).toString();

  return (
    <>
      <Header />
      <div className="h-20 w-full" />
      <div className="min-h-screen dark:bg-background">
        <HotelStickySearchPanel
          city={city}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          query={queryStr}
        />

        <div className="py-4">
          <HotelResultsContent
            initialData={result.data || []}
            city={city}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
            query={queryStr}
          />
        </div>
      </div>
    </>
  );
}
