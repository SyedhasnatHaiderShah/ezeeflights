import Link from 'next/link';
import { SearchForm } from '@/components/hotels/SearchForm';
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
    <section className="space-y-4 pb-8">
      <div className="sticky top-0 z-30 rounded-xl border border-border/70 bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <SearchForm />
      </div>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Hotels in {city || 'your destination'}</h1>
        <Link
          href={`/hotels/map-view?${query.toString()}`}
          className="inline-flex items-center rounded-lg border border-brand-red/60 px-3 py-2 text-sm font-semibold text-brand-red hover:bg-brand-red hover:text-white"
        >
          Toggle Map View
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit space-y-4 rounded-2xl border border-border/70 bg-card p-4 lg:sticky lg:top-28">
          <h2 className="text-base font-semibold">Filters</h2>
          <div>
            <p className="mb-2 text-sm font-medium">Price per night</p>
            <input type="range" min={50} max={900} defaultValue={300} className="w-full accent-brand-red" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Star rating</p>
            <div className="space-y-1 text-sm">
              {[5, 4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center gap-2">
                  <input type="checkbox" /> {star} stars
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Guest rating</p>
            <div className="space-y-1 text-sm">
              {['Any', '7+', '8+', '9+'].map((label) => (
                <label key={label} className="flex items-center gap-2">
                  <input type="radio" name="guest-rating" defaultChecked={label === 'Any'} /> {label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Property type</p>
            <div className="space-y-1 text-sm">
              {['Hotel', 'Resort', 'Apartments', 'Villa'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" /> {item}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Amenities</p>
            <div className="space-y-1 text-sm">
              {['Pool', 'Spa', 'Free WiFi', 'Parking', 'Gym'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" /> {item}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Meal plan</p>
            <div className="space-y-1 text-sm">
              {['Room only', 'Breakfast', 'Half board', 'All inclusive'].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" /> {item}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Distance to center</p>
            <input type="range" min={1} max={20} defaultValue={8} className="w-full accent-brand-red" />
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card p-3 text-sm">
            <span className="font-medium">Sort by:</span>
            {['Recommended', 'Price', 'Rating', 'Distance'].map((sort, index) => (
              <button key={sort} type="button" className={`rounded-full px-3 py-1 ${index === 0 ? 'bg-brand-red text-white' : 'bg-muted/70 hover:bg-muted'}`}>
                {sort}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {result.data?.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} checkInDate={checkInDate} checkOutDate={checkOutDate} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
