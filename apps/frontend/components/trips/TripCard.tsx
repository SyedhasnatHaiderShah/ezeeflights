import Link from 'next/link';
import { Calendar, Car, Hotel, MapPin, Plane, Package2 } from 'lucide-react';
import { TripSummary } from '@/lib/api/trips';

const statusClasses: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

const typeIcon = {
  flight: Plane,
  hotel: Hotel,
  package: Package2,
  car: Car,
  transfer: MapPin,
};

export function TripCard({ trip }: { trip: TripSummary }) {
  const Icon = typeIcon[trip.type];
  return (
    <Link href={`/my-trips/${trip.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-600" />
          <p className="font-semibold text-slate-900">{trip.title}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[trip.status] ?? 'bg-slate-100 text-slate-700'}`}>
          {trip.status}
        </span>
      </div>
      <p className="text-sm text-slate-600">{trip.subtitle}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        <Calendar className="h-4 w-4" />
        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-500">{trip.confirmationCode}</span>
        <span className="font-semibold text-slate-900">
          {trip.currency} {trip.total.toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
