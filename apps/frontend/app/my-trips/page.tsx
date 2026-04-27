'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plane } from 'lucide-react';
import { getMyTrips, TripStatusFilter, TripSummary } from '@/lib/api/trips';
import { TripCard } from '@/components/trips/TripCard';
import { TripTabs, TripTab } from '@/components/trips/TripTabs';
import { AppImage } from '@/components/ui/app-image';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop';

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

  const stats = useMemo(() => {
    const upcoming = trips.filter(t => t.status === 'upcoming').length;
    const completed = trips.filter(t => t.status === 'completed').length;
    const totalBookings = trips.length;
    return { upcoming, completed, totalBookings };
  }, [trips]);

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-[60vh] w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <AppImage
            src={HERO_IMAGE}
            alt="Travel adventures"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-center justify-center px-3 md:px-5 pb-10 text-white">
          <span className="mb-4 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
            Your Travel Dashboard
          </span>
          <h1 className="text-hero text-center font-extrabold text-white">
            My{' '}
            <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent">
              Trips
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-center text-lg text-white/80">
            Your unified bookings across flights, hotels, packages, cars, and transfers.
          </p>

          {/* Stats Grid */}
          <div className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-3 rounded-2xl border border-white/20 bg-white/5 p-4 backdrop-blur-md">
            <div className="text-center">
              <div className="text-xl font-extrabold">{stats.upcoming}</div>
              <p className="text-xs text-white/90">Upcoming</p>
            </div>
            <div className="text-center border-l border-white/30">
              <div className="text-xl font-extrabold">{stats.completed}</div>
              <p className="text-xs text-white/90">Completed</p>
            </div>
            <div className="text-center border-l border-white/30">
              <div className="text-xl font-extrabold">{stats.totalBookings}</div>
              <p className="text-xs text-white/90">Total Trips</p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="absolute bottom-4 text-white/80"
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="mx-auto w-full max-w-[1400px] px-3 md:px-5 py-8">
        <div className="space-y-4">
          <TripTabs active={tab} onChange={setTab} counts={counts} />

          <div className="flex flex-wrap gap-2">
            {(['upcoming', 'completed', 'cancelled'] as TripStatusFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`rounded-full border px-3 py-1 text-sm capitalize transition-colors ${
                  status === item
                    ? 'border-redmix bg-redmix/10 text-redmix'
                    : 'border-slate-200 hover:border-redmix/50'
                }`}
                onClick={() => setStatus(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {trips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Plane className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold">No trips found</p>
              <p className="mb-4 text-sm text-slate-600">Start planning your next journey.</p>
              <Link
                href="/flights"
                className="inline-block rounded-lg bg-redmix px-4 py-2 text-sm text-white transition hover:brightness-110"
              >
                Search flights
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
