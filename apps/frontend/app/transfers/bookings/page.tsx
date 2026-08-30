'use client';

import { useEffect, useState } from 'react';
import { apiFetchAuth } from '@/lib/api/client';

interface TransferBooking {
  id: string;
  confirmationCode: string;
  status: string;
  pickupDatetime: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengerName: string;
  passengerCount: number;
  price: number;
  currency: string;
}

export default function MyTransferBookingsPage() {
  const [bookings, setBookings] = useState<TransferBooking[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetchAuth<TransferBooking[]>('/transfers/bookings/me')
      .then(setBookings)
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My Transfer Bookings</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-3">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded border bg-white p-4">
            <p className="font-semibold">{booking.confirmationCode}</p>
            <p className="capitalize">{booking.status.replace('_', ' ')}</p>
            <p>{new Date(booking.pickupDatetime).toLocaleString()}</p>
            <p>
              {booking.pickupAddress} → {booking.dropoffAddress}
            </p>
            <p>
              {booking.passengerName} · {booking.passengerCount} pax
            </p>
            <p>
              {booking.currency} {booking.price}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
