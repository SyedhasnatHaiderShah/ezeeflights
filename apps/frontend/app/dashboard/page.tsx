'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { CalendarDays, BriefcaseBusiness, Luggage, Ticket, PlaneTakeoff, Download, Bell } from 'lucide-react';
import { TripCard } from '@/components/trips/TripCard';

interface UserProfile { id: string; email: string; preferredCurrency: string; firstName?: string }
interface Booking { id: string; status: string; totalAmount: number; currency: string; title?: string; subtitle?: string; startDate?: string; endDate?: string; confirmationCode?: string; type?: 'flight' | 'hotel' | 'package' | 'car' | 'transfer' }

export default function DashboardPage() {
  const session = useAuthSession();
  const profileQuery = useQuery({ queryKey: ['profile', 'bff'], queryFn: () => apiFetch<UserProfile>('/user/profile'), enabled: Boolean(session.data) });
  const bookingsQuery = useQuery({ queryKey: ['bookings', 'bff'], queryFn: () => apiFetch<Booking[]>('/booking/me'), enabled: Boolean(session.data) });

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const name = session.data?.firstName || profileQuery.data?.firstName || 'Traveler';

  const mappedTrips = useMemo(() => (bookingsQuery.data ?? []).map((b) => ({
    id: b.id,
    type: b.type ?? 'flight',
    title: b.title ?? 'Upcoming journey',
    subtitle: b.subtitle ?? 'Manage your booking details',
    status: String(b.status).toLowerCase(),
    startDate: b.startDate ?? new Date().toISOString(),
    endDate: b.endDate ?? new Date(Date.now() + 86400000).toISOString(),
    confirmationCode: b.confirmationCode ?? b.id.slice(0, 8).toUpperCase(),
    currency: b.currency,
    total: b.totalAmount,
  })), [bookingsQuery.data]);

  if (session.isLoading) return <p className="rounded border bg-slate-50 p-4">Checking session…</p>;
  if (!session.data) return <p className="rounded border bg-amber-50 p-4">Sign in to view your dashboard.</p>;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">{greeting}, {name} 👋</h1>
          <p className="text-sm text-muted-foreground">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Upcoming trips</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {mappedTrips.slice(0, 2).map((trip) => (
              <div key={trip.id} className="relative">
                <span className="absolute right-3 top-3 z-10 rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-dark-blue">3 days away</span>
                <TripCard trip={trip as any} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[{ icon: BriefcaseBusiness, label: 'Manage Booking' }, { icon: Luggage, label: 'Add Bags' }, { icon: PlaneTakeoff, label: 'Web Check-in' }, { icon: Download, label: 'Download Ticket' }].map((item) => (
              <button key={item.label} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-redmix/10 p-4 text-sm font-medium hover:bg-redmix/20">
                <item.icon className="h-5 w-5 text-redmix" />{item.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent searches</h2>
          <div className="flex flex-wrap gap-2">{['DXB → JFK','LAX → LHR','JFK → SFO','AUH → LHE'].map((chip) => <span key={chip} className="rounded-full border bg-muted/40 px-4 py-2 text-sm">{chip}</span>)}</div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Active price alerts</h2>
          <div className="space-y-2">
            {[{ route: 'DXB → JFK', alert: 620, current: 598 }, { route: 'LHE → AUH', alert: 210, current: 235 }].map((a) => (
              <div key={a.route} className="rounded-xl border bg-card p-4 text-sm">
                <div className="flex items-center justify-between"><p className="font-medium">{a.route}</p><Bell className="h-4 w-4 text-redmix" /></div>
                <p className="text-muted-foreground">Alert: ${a.alert} • Current: <span className="font-semibold text-foreground">${a.current}</span></p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-brand-dark-blue p-5 text-white">
          <p className="text-sm text-white/80">Gold Member</p>
          <p className="text-3xl font-bold">24,800 pts</p>
          <div className="mt-3 h-2 rounded-full bg-white/20"><div className="h-2 w-3/4 rounded-full bg-brand-yellow" /></div>
          <p className="mt-2 text-xs text-white/80">1,200 points to Platinum</p>
          <a href="/profile/loyalty" className="mt-3 inline-block text-sm text-brand-yellow">Earn more</a>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <h3 className="font-semibold">Your next trip weather</h3>
          <p className="text-sm text-muted-foreground">New York</p>
          <div className="mt-3 space-y-2 text-sm">
            {['Tue 18° 🌤️', 'Wed 17° 🌦️', 'Thu 20° ☀️'].map((d) => <div key={d} className="flex items-center justify-between"><span>{d.split(' ')[0]}</span><span>{d.slice(4)}</span></div>)}
          </div>
        </div>
      </aside>
    </section>
  );
}
