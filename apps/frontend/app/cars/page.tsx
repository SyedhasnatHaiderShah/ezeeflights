import { CarCard } from '@/components/cars/CarCard';
import { CarSearchForm } from '@/components/cars/CarSearchForm';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { SupportFaqAccordion } from '@/components/support/SupportFaqAccordion';
import { searchCars } from '@/lib/api/cars';

const carFaqs = [
  {
    q: 'Can I return the car to a different location?',
    a: 'Yes. Select a separate drop-off location in the car search section before you run the search.',
  },
  {
    q: 'What documents do I need at pickup?',
    a: 'Most providers require a valid driving license, passport or ID, and a payment card in the main driver name.',
  },
  {
    q: 'Are taxes and fees included in the price?',
    a: 'Base rates are shown in search results. Final totals including location-specific fees appear during booking.',
  },
];

export default async function CarsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const hasSearch = Boolean(searchParams.pickup_location && searchParams.pickup_date && searchParams.dropoff_date);
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
      <Header />

      <main className="flex-1 pt-20">
        <section className="border-b border-border/60 bg-linear-to-b from-emerald-100/20 via-transparent to-transparent">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
            <div className="mb-6 max-w-2xl space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Rent a car for your next trip</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Pick your locations and dates, compare categories, and find the best car rental option in minutes.
              </p>
            </div>

            <CarSearchForm />

            <div className="mt-6 grid gap-4 md:grid-cols-[280px_1fr]">
              <aside className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
                <h2 className="font-semibold">Filters</h2>
                <p className="text-sm text-muted-foreground">
                  Use URL params to apply extra filters: `category`, `transmission`, `max_price`, `unlimited_mileage`.
                </p>
              </aside>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
                {hasSearch && cars.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No cars found for selected criteria.</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card p-5 md:p-8">
            <h2 className="mb-2 text-xl font-semibold md:text-2xl">Car rental FAQs</h2>
            <p className="mb-5 text-sm text-muted-foreground md:text-base">
              Key things to know before choosing your vehicle.
            </p>
            <SupportFaqAccordion faqs={carFaqs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
