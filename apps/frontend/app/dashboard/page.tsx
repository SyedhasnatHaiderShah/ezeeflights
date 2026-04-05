'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/auth-store';

interface UserProfile {
  id: string;
  email: string;
  preferredCurrency: string;
}

interface Booking {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.accessToken);

  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () =>
      apiFetch<UserProfile>('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: Boolean(token),
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings', token],
    queryFn: () =>
      apiFetch<Booking[]>('/booking/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: Boolean(token),
  });

  if (!token) {
    return <p className="rounded border bg-amber-50 p-4">Sign in to view your dashboard.</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Traveler Dashboard</h1>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Profile</h2>
        {profileQuery.isLoading && <p>Loading profile...</p>}
        {profileQuery.data && <p>{profileQuery.data.email} · {profileQuery.data.preferredCurrency}</p>}
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Bookings</h2>
        {bookingsQuery.isLoading && <p>Loading bookings...</p>}
        <ul className="space-y-2">
          {bookingsQuery.data?.map((booking) => (
            <li key={booking.id}>
              {booking.id} · {booking.status} · {booking.currency} {booking.totalAmount}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
