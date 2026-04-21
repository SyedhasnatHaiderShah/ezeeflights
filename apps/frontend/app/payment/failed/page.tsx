'use client';

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const params = useSearchParams();
  const bookingId = params.get('bookingId');

  return (
    <main className="mx-auto mt-12 max-w-xl space-y-5 p-8 text-center">
      <motion.div initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">✕</motion.div>
      <h1 className="text-2xl font-bold text-red-700">Payment Failed</h1>
      <p className="text-gray-600">Error reason: issuer declined transaction. Please verify card details or try another payment method.</p>
      {bookingId && <Link href={`/payment/checkout?bookingId=${bookingId}`} className="inline-block rounded bg-brand-red px-5 py-2.5 text-white">Try Again</Link>}
      <ul className="space-y-1 rounded-lg border p-4 text-left text-sm"><li>• Card limit exceeded</li><li>• 3D Secure authentication failed</li><li>• Insufficient wallet balance</li></ul>
      <Link href="/support" className="text-brand-red underline">Contact Support</Link>
    </main>
  );
}
