import Link from 'next/link';
import { Calendar, Plane, Download, Settings, CheckSquare } from 'lucide-react';
import { TripSummary } from '@/lib/api/trips';

const statusClasses: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function TripCard({ trip }: { trip: TripSummary }) {
  const isUpcoming = new Date(trip.startDate).getTime() > Date.now();
  const days = Math.max(1, Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000));
  return (
    <Link href={`/my-trips/${trip.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-redmix/20 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500">Airline</p>
          <p className="font-semibold text-slate-900">{trip.title || 'DXB → JFK'}</p>
          <p className="text-xs text-slate-500">Booking ref: {trip.confirmationCode}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusClasses[trip.status] ?? 'bg-slate-100 text-slate-700'}`}>{trip.status}</span>
      </div>
      <p className="text-sm text-slate-600">{trip.subtitle}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Calendar className="h-4 w-4" />{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
      {isUpcoming && <span className="mt-3 inline-block rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-dark-blue">In {days} days</span>}
      <div className="mt-4 flex gap-2 text-xs">
        <button className="rounded-md border px-2 py-1"> <Settings className="mr-1 inline h-3 w-3" />Manage</button>
        <button className="rounded-md border px-2 py-1"> <Download className="mr-1 inline h-3 w-3" />Download</button>
        <button className="rounded-md border px-2 py-1"> <CheckSquare className="mr-1 inline h-3 w-3" />Check-in</button>
      </div>
    </Link>
  );
}
