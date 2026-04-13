import Link from 'next/link';
import { Car } from '@/lib/api/cars';

export function CarCard({ car }: { car: Car }) {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">{car.category}</span>
        <span className="text-lg font-bold">
          {car.currency} {car.pricePerDay}/day
        </span>
      </div>
      <h3 className="text-lg font-semibold">{car.make + ' ' + car.model}</h3>
      <p className="text-sm text-slate-600">
        {car.seats} seats · {car.doors} doors · {car.transmission}
      </p>
      <Link href={`/cars/${car.id}`} className="mt-4 inline-block rounded bg-slate-900 px-3 py-2 text-sm text-white">
        View details
      </Link>
    </article>
  );
}
