'use client';

import { useSearchParams } from 'next/navigation';

export default function ConfirmationPage() {
  const params = useSearchParams();
  return (
    <section className="rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-bold text-green-700">Booking Confirmed</h1>
      <p>Your booking reference: {params.get('bookingId')}</p>
    </section>
  );
}
