'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <main className="mx-auto max-w-xl p-8 text-center mt-12">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-9 h-9 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-red-700">Payment Failed</h1>
      <p className="mt-3 text-gray-600">We couldn't process your payment. Please try again with a different payment method.</p>

      <div className="mt-8 flex gap-3 justify-center">
        {bookingId && (
          <Link
            href={`/payment/checkout?bookingId=${bookingId}`}
            className="rounded-lg bg-blue-600 text-white px-5 py-2.5 font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
        )}
        <Link
          href="/support"
          className="rounded-lg border border-gray-300 text-gray-700 px-5 py-2.5 font-medium hover:bg-gray-50 transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </main>
  );
}
