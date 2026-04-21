import { BookingForm } from '@/components/booking-form';
import { HotelCard } from '@/components/hotels/HotelCard';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';

const topHotels = [
  { id: 'ht-1', name: 'Royal Palm Resort', city: 'Dubai', country: 'UAE', rating: 4.8, minPricePerNight: 189, currency: 'USD' },
  { id: 'ht-2', name: 'Le Grand Opera', city: 'Paris', country: 'France', rating: 4.6, minPricePerNight: 240, currency: 'USD' },
  { id: 'ht-3', name: 'Mayfair Skyline', city: 'London', country: 'UK', rating: 4.7, minPricePerNight: 215, currency: 'USD' },
];

const heroImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80',
];

export default function HotelsLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-20">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 grid grid-cols-3 opacity-25">
            {heroImages.map((src) => (
              <div key={src} className="relative h-full w-full">
                <img src={src} alt="Luxury hotel" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
            <div className="mb-6 max-w-2xl space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Find Your Perfect Stay</h1>
              <p className="text-sm text-muted-foreground md:text-base">Search top stays, compare offers, and book your next hotel in minutes.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/95 p-4 backdrop-blur">
              <BookingForm defaultTab="hotels" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-screen-2xl space-y-8 px-4 py-8 md:px-6 md:py-12">
          <div>
            <h2 className="mb-3 text-xl font-semibold">Popular Hotel Cities</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['Dubai', 'Paris', 'London', 'NYC', 'Singapore'].map((city) => (
                <button key={city} type="button" className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-brand-red/50">
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Top Rated Hotels</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} checkInDate="2026-05-01" checkOutDate="2026-05-04" />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
