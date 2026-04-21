'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { BriefcaseBusiness, Luggage, Download, Bell } from 'lucide-react';
import { TripCard } from '@/components/trips/TripCard';
import { useLoyaltyProfile } from '@/lib/api/loyalty';
import { useRecentSearches } from '@/lib/api/search';

interface UserProfile { id: string; email: string; preferredCurrency: string; firstName?: string }
interface Booking { id: string; status: string; totalAmount: number; currency: string; title?: string; subtitle?: string; startDate?: string; endDate?: string; confirmationCode?: string; type?: 'flight' | 'hotel' | 'package' | 'car' | 'transfer' }

export default function DashboardPage() {
  const session = useAuthSession();
  const profileQuery = useQuery({ queryKey: ['profile', 'bff'], queryFn: () => apiFetch<UserProfile>('/user/profile'), enabled: Boolean(session.data) });
  const bookingsQuery = useQuery({ queryKey: ['bookings', 'bff'], queryFn: () => apiFetch<Booking[]>('/booking/me'), enabled: Boolean(session.data) });
  const alertsQuery = useQuery({ queryKey: ['price-alerts'], queryFn: () => apiFetch<any[]>('/notifications/price-alerts'), enabled: Boolean(session.data) });
  const loyaltyQuery = useLoyaltyProfile();
  const recentQuery = useRecentSearches(6, Boolean(session.data));

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
            {mappedTrips.slice(0, 2).map((trip) => (<div key={trip.id} className="relative"><TripCard trip={trip as any} /></div>))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[{ icon: BriefcaseBusiness, label: 'Manage Booking' }, { icon: Luggage, label: 'Add Bags' }, { icon: Download, label: 'Download Ticket' }].map((item) => (<button key={item.label} className="flex flex-col items-center justify-center gap-2 rounded-xl bg-redmix/10 p-4 text-sm font-medium hover:bg-redmix/20"><item.icon className="h-5 w-5 text-redmix" />{item.label}</button>))}</div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent searches</h2>
          <div className="flex flex-wrap gap-2">{(recentQuery.data ?? []).map((chip) => <span key={chip.id} className="rounded-full border bg-muted/40 px-4 py-2 text-sm">{chip.origin} → {chip.destination}</span>)}</div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Active price alerts</h2>
          <div className="space-y-2">{(alertsQuery.data ?? []).map((a: any, i) => (<div key={a.id ?? i} className="rounded-xl border bg-card p-4 text-sm"><div className="flex items-center justify-between"><p className="font-medium">{a.route || 'Price Alert'}</p><Bell className="h-4 w-4 text-redmix" /></div><p className="text-muted-foreground">Target: ${a.targetPrice ?? 0}</p></div>))}</div>
        </section>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-brand-dark-blue p-5 text-white">
          <p className="text-sm text-white/80">{(loyaltyQuery.data as any)?.tier ?? 'Member'}</p>
          <p className="text-3xl font-bold">{((loyaltyQuery.data as any)?.pointsBalance ?? 0).toLocaleString()} pts</p>
        </div>
      </aside>
    </section>
  );
}
