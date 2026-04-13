'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getMyTrips, TripStatusFilter, TripSummary } from '@/lib/api/trips';
import { TripCard } from '@/components/trips/TripCard';
import { TripTabs, TripTab } from '@/components/trips/TripTabs';

export default function MyTripsPage() {
  const [tab, setTab] = useState<TripTab>('all');
  const [status, setStatus] = useState<TripStatusFilter>('upcoming');
  const [trips, setTrips] = useState<TripSummary[]>([]);

  useEffect(() => {
    getMyTrips(tab === 'all' ? undefined : tab, status).then(setTrips).catch(() => setTrips([]));
  }, [tab, status]);

  const counts = useMemo(() => {
    const base: Record<TripTab, number> = { all: trips.length, flight: 0, hotel: 0, package: 0, car: 0, transfer: 0 };
    trips.forEach((trip) => {
      if (trip.type in base) base[trip.type as Exclude<TripTab, 'all'>] += 1;
    });
    return base;
  }, [trips]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Trips</h1>
        <p className="text-sm text-slate-600">Your unified bookings across flights, hotels, packages, cars, and transfers.</p>
      </div>

      <TripTabs active={tab} onChange={setTab} counts={counts} />

      <div className="flex flex-wrap gap-2">
        {(['upcoming', 'completed', 'cancelled'] as TripStatusFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`rounded-full border px-3 py-1 text-sm capitalize ${status === item ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'}`}
            onClick={() => setStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {trips.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-lg font-semibold">No trips found</p>
          <p className="mb-4 text-sm text-slate-600">Start planning your next journey.</p>
          <Link href="/flights/search" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
            Search trips
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}
