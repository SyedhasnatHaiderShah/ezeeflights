import { CarCard } from '@/components/cars/CarCard';
import { CarSearchForm } from '@/components/cars/CarSearchForm';
import { searchCars } from '@/lib/api/cars';

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
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Car Rental</h1>
      <CarSearchForm />

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="space-y-3 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Filters</h2>
          <p className="text-sm text-slate-600">Use URL params to apply filters: category, transmission, max_price, unlimited_mileage.</p>
        </aside>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
          {hasSearch && cars.length === 0 ? <p className="text-sm text-slate-500">No cars found for selected criteria.</p> : null}
        </div>
      </div>
    </section>
  );
}
