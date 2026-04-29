import { HotelCard } from "@/components/hotels/HotelCard";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Hotel } from "@/lib/types/hotels";

const topHotels: Hotel[] = [
  {
    id: "ht-1",
    name: "Royal Palm Resort",
    type: "Resort",
    starRating: 5,
    userRating: 4.8,
    reviewCount: 1250,
    address: "123 Palm Jumeirah",
    city: "Dubai",
    country: "UAE",
    coordinates: { lat: 25.1124, lng: 55.139 },
    minPricePerNight: 189,
    currency: "USD",
    amenities: ["Pool", "Spa", "Beach Front"],
    images: [
      { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb" },
    ],
    rooms: [
      {
        id: "rm1",
        name: "Deluxe King Room",
        description: "Spacious room with palm view",
        pricePerNight: 189,
        totalPrice: 189,
        images: [],
        amenities: ["WiFi", "AC"],
        isAvailableForUpgrade: true,
        breakfastIncluded: true,
        freeCancellation: true,
        capacity: 2,
      },
    ],
    reviews: [],
  },
  {
    id: "ht-2",
    name: "Le Grand Opera",
    type: "Hotel",
    starRating: 5,
    userRating: 4.6,
    reviewCount: 840,
    address: "Rue de la Paix",
    city: "Paris",
    country: "France",
    coordinates: { lat: 48.8606, lng: 2.3376 },
    minPricePerNight: 240,
    currency: "USD",
    amenities: ["City View", "Free WiFi", "Breakfast"],
    images: [
      { url: "https://images.unsplash.com/photo-1551882547-ff43c61f38e4" },
    ],
    rooms: [
      {
        id: "rm2",
        name: "Classic Queen",
        description: "Elegant Parisian style",
        pricePerNight: 240,
        totalPrice: 240,
        images: [],
        amenities: ["WiFi"],
        isAvailableForUpgrade: false,
        breakfastIncluded: false,
        freeCancellation: false,
        capacity: 2,
      },
    ],
    reviews: [],
  },
  {
    id: "ht-3",
    name: "Mayfair Skyline",
    type: "Hotel",
    starRating: 4,
    userRating: 4.7,
    reviewCount: 2100,
    address: "Mayfair",
    city: "London",
    country: "UK",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    minPricePerNight: 215,
    currency: "USD",
    amenities: ["Butler Service", "Gym", "Lounge"],
    images: [
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
    ],
    rooms: [
      {
        id: "rm3",
        name: "Executive Suite",
        description: "Modern luxury in the heart of London",
        pricePerNight: 215,
        totalPrice: 215,
        images: [],
        amenities: ["WiFi", "Gym"],
        isAvailableForUpgrade: true,
        breakfastIncluded: true,
        freeCancellation: true,
        capacity: 2,
      },
    ],
    reviews: [],
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
