import { HotelCard } from "@/components/hotels/HotelCard";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";

const topHotels = [
  {
    id: "ht-1",
    name: "Royal Palm Resort",
    city: "Dubai",
    country: "UAE",
    rating: 4.8,
    minPricePerNight: 189,
    currency: "USD",
  },
  {
    id: "ht-2",
    name: "Le Grand Opera",
    city: "Paris",
    country: "France",
    rating: 4.6,
    minPricePerNight: 240,
    currency: "USD",
  },
  {
    id: "ht-3",
    name: "Mayfair Skyline",
    city: "London",
    country: "UK",
    rating: 4.7,
    minPricePerNight: 215,
    currency: "USD",
  },
];

export default function HotelsLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header transparent />
      <main className="flex-1">
        <Hero
          defaultTab="hotels"
          badgeText="#1 Hotel Booking Platform"
          title={
            <>
              Find Your Perfect{" "}
              <span className="bg-linear-to-r from-redmix to-yellow bg-clip-text text-transparent">
                Stay
              </span>
            </>
          }
          description="Compare hotels, discover great rates, and book your next stay in minutes."
        />

        <section className="mx-auto w-full max-w-screen-2xl space-y-8 px-4 py-8 md:px-6 md:py-12">
          <div>
            <h2 className="mb-3 text-xl font-semibold">Popular Hotel Cities</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["Dubai", "Paris", "London", "NYC", "Singapore"].map((city) => (
                <button
                  key={city}
                  type="button"
                  className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-brand-red/50"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Top Rated Hotels</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  checkInDate="2026-05-01"
                  checkOutDate="2026-05-04"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
