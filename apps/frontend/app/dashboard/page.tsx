'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

export default function DashboardPage() {
  const bookingHealth = useQuery({
    queryKey: ['booking-health'],
    queryFn: () => apiFetch<{ module: string; status: string }>('/booking/health'),
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Traveler Dashboard</h1>
      <p className="text-slate-600">Client-side fetching via React Query for personalized data.</p>
      <div className="rounded border bg-white p-4">
        {bookingHealth.isLoading && <p>Loading...</p>}
        {bookingHealth.data && <p>Booking Service: {bookingHealth.data.status}</p>}
      </div>
    </section>
  );
}
