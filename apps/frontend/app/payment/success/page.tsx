'use client';
import { Suspense } from 'react';


import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';

interface PaymentDetails { id: string; status: string; amount: number; currency: string; bookingId: string; }

function PaymentSuccessPageContent() {
  const params = useSearchParams();
  const paymentId = params.get('payment_id');
  const { data: payment } = useQuery<PaymentDetails>({ queryKey: ['payment-status', paymentId], queryFn: () => apiFetch(`/payments/${paymentId}`), enabled: !!paymentId });

  return (
    <main className="mx-auto mt-12 max-w-2xl space-y-6 p-8 text-center">
      <motion.svg viewBox="0 0 52 52" className="mx-auto h-20 w-20" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
        <motion.circle cx="26" cy="26" r="25" fill="none" stroke="#16a34a" strokeWidth="2" />
        <motion.path d="M14 27l8 8 16-18" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
      </motion.svg>
      <h1 className="text-3xl font-bold text-emerald-700">Payment Successful</h1>
      <div className="rounded-xl border bg-slate-50 p-4 text-left"><p className="text-sm">Booking reference</p><p className="font-mono text-lg">{payment?.bookingId || 'Pending'}</p></div>
      <div className="grid gap-3 md:grid-cols-3">{['Ticket issued', 'Email confirmation sent', 'Manage trip in My Trips'].map((x) => <div key={x} className="rounded-xl border p-3 text-sm">{x}</div>)}</div>
      <div className="flex justify-center gap-3"><button className="rounded border px-4 py-2">Share</button><button className="rounded bg-brand-red px-4 py-2 text-white">Download</button></div>
    </main>
  );
}

// Suspense-wrapped
export default function PaymentSuccessPage(props: any) {
  return <Suspense fallback={null}><PaymentSuccessPageContent {...props} /></Suspense>;
}
