import { CarCard } from "@/components/cars/CarCard";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { searchCars } from "@/lib/api/cars";

const categories = [
  { name: "Economy", icon: "🚗", price: 39 },
  { name: "SUV", icon: "🚙", price: 62 },
  { name: "Luxury", icon: "🏎️", price: 129 },
  { name: "Van", icon: "🚐", price: 74 },
  { name: "Convertible", icon: "🏁", price: 99 },
];

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const hasSearch = Boolean(
    searchParams.pickup_location &&
    searchParams.pickup_date &&
    searchParams.dropoff_date,
  );
  const cars = hasSearch
    ? await searchCars({
        pickup_location: searchParams.pickup_location,
        dropoff_location: searchParams.dropoff_location,
        pickup_date: searchParams.pickup_date,
        dropoff_date: searchParams.dropoff_date,
        category: searchParams.category,
        max_price: searchParams.max_price,
        unlimited_mileage: searchParams.unlimited_mileage,
        transmission: searchParams.transmission,
      })
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header transparent />
      <main className="flex-1">
        <Hero
          defaultTab="cars"
          badgeText="#1 Car Rental Platform"
          title={
            <>
              Find the Perfect{" "}
              <span className="bg-linear-to-r from-redmix to-yellow bg-clip-text text-transparent">
                Ride
              </span>
            </>
          }
          description="Choose from economy to luxury cars and book instantly at transparent rates."
        />

        <section className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-6 md:py-10">
          <h2 className="mb-4 text-xl font-semibold">Browse by category</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <article
                key={category.name}
                className="rounded-xl border border-border/70 bg-card p-4"
              >
                <p className="text-2xl">{category.icon}</p>
                <p className="mt-2 font-semibold">{category.name}</p>
                <p className="text-sm text-muted-foreground">
                  From ${category.price}/day
                </p>
              </article>
            ))}
          </div>
        </section>

        {hasSearch && (
          <section className="mx-auto w-full max-w-screen-2xl px-4 pb-10 md:px-6 md:pb-14">
            <h2 className="mb-4 text-xl font-semibold">Available cars</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
              {cars.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No cars found for selected criteria.
                </p>
              ) : null}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
