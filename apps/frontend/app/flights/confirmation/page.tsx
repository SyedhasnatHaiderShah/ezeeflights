'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';

interface BookingDetails {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export default function ConfirmationPage() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  const { data: booking, isLoading } = useQuery<BookingDetails>({
    queryKey: ['booking-confirmation', bookingId],
    queryFn: () => apiFetch(`/bookings/me/${bookingId}`),
    enabled: !!bookingId,
  });

  if (!bookingId) {
    return (
      <section className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-red-700">Invalid Booking</h1>
        <p className="mt-3 text-gray-600">No booking reference provided.</p>
        <Link href="/" className="mt-6 inline-block text-blue-600 underline">Return home</Link>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-xl p-8 text-center">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-md mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-700">Booking Confirmed</h1>
      </div>

      <dl className="space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <dt className="font-medium">Booking Reference</dt>
          <dd className="font-mono text-gray-900">{booking?.id ?? bookingId}</dd>
        </div>
        {booking && (
          <>
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd className="capitalize">{booking.status.toLowerCase()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Payment</dt>
              <dd className="capitalize">{booking.paymentStatus.toLowerCase()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Total</dt>
              <dd className="font-semibold">{booking.currency} {booking.totalAmount.toFixed(2)}</dd>
            </div>
          </>
        )}
      </dl>

      <div className="mt-8 flex gap-3">
        <Link
          href="/my-trips"
          className="flex-1 text-center rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition-colors"
        >
          View My Trips
        </Link>
        <Link
          href="/"
          className="flex-1 text-center rounded-lg border border-gray-300 text-gray-700 py-2.5 font-medium hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
