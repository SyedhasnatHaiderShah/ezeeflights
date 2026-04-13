'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';

interface PaymentDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
  bookingId: string;
}

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const paymentId = params.get('payment_id');

  const { data: payment } = useQuery<PaymentDetails>({
    queryKey: ['payment-status', paymentId],
    queryFn: () => apiFetch(`/payments/${paymentId}`),
    enabled: !!paymentId,
  });

  return (
    <main className="mx-auto max-w-xl p-8 text-center mt-12">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-9 h-9 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-emerald-700">Payment Successful</h1>
      <p className="mt-3 text-gray-600">Your booking has been confirmed.</p>

      {payment && (
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment ID</span>
            <span className="font-mono text-gray-800">{payment.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold">{payment.currency} {payment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="text-emerald-600 font-medium capitalize">{payment.status.toLowerCase()}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3 justify-center">
        {payment?.bookingId && (
          <Link
            href={`/flights/confirmation?bookingId=${payment.bookingId}`}
            className="rounded-lg bg-blue-600 text-white px-5 py-2.5 font-medium hover:bg-blue-700 transition-colors"
          >
            View Booking
          </Link>
        )}
        <Link
          href="/my-trips"
          className="rounded-lg border border-gray-300 text-gray-700 px-5 py-2.5 font-medium hover:bg-gray-50 transition-colors"
        >
          My Trips
        </Link>
      </div>
    </main>
  );
}
