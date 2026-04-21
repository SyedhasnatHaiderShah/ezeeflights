import Link from 'next/link';
import { PriceTag } from '@/components/ui/price-tag';
import { Car } from '@/lib/api/cars';

export function CarCard({ car }: { car: Car }) {
  const category = car.category.charAt(0).toUpperCase() + car.category.slice(1);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-brand-red/20 hover:shadow-md">
      <div className="relative mb-3 aspect-video overflow-hidden rounded-xl bg-muted">
        <img
          src={car.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80'}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">{category}</span>
      </div>

      <h3 className="text-lg font-semibold">{car.make + ' ' + car.model}</h3>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <p>👥 {car.seats} Passengers</p>
        <p>🧳 3 Bags</p>
        <p>⚙ {car.transmission}</p>
        <p>❄ {car.airConditioning ? 'A/C' : 'No A/C'}</p>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/80 pt-3">
        <div>
          <PriceTag amount={car.pricePerDay} currency={car.currency} size="sm" className="gap-0" />
          <p className="text-xs text-muted-foreground">Estimated total: {(car.pricePerDay * 3).toFixed(0)} {car.currency}</p>
        </div>
        <Link href={`/cars/${car.id}`} className="inline-flex rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white">
          Book Now
        </Link>
      </div>
    </article>
  );
}
