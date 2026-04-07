import { HotelCard } from '@/components/hotels/HotelCard';
import { internalV1Url } from '@/lib/bff/config';

interface SearchResponse {
  data: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    rating: number;
    minPricePerNight: number;
    currency: string;
  }>;
}

export default async function HotelResultsPage({
  searchParams,
}: {
  searchParams: { city?: string; checkInDate?: string; checkOutDate?: string; page?: string; limit?: string };
}) {
  const city = searchParams.city ?? '';
  const checkInDate = searchParams.checkInDate ?? '';
  const checkOutDate = searchParams.checkOutDate ?? '';
  const query = new URLSearchParams({ city, checkInDate, checkOutDate, page: searchParams.page ?? '1', limit: searchParams.limit ?? '12' });

  const response = await fetch(internalV1Url(`hotels/search?${query.toString()}`), { cache: 'no-store' });
  const result = (await response.json()) as SearchResponse;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Hotels in {city}</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {result.data?.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} checkInDate={checkInDate} checkOutDate={checkOutDate} />
        ))}
      </div>
    </section>
  );
}
