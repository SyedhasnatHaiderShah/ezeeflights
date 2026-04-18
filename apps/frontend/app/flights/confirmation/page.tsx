'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api/client';
import Link from 'next/link';
import { Copy, CalendarPlus, Download, Share2 } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

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
  const { toast } = useToast();

  const { data: booking, isLoading, refetch } = useQuery<BookingDetails>({
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
    return <section className="mx-auto max-w-xl p-8 text-center"><div className="animate-pulse h-40 rounded-xl bg-muted" /></section>;
  }

  if (!booking) {
    return (
      <section className="mx-auto max-w-xl p-8 text-center space-y-3">
        <h1 className="text-2xl font-bold">Unable to load booking</h1>
        <button onClick={() => refetch()} className="rounded bg-brand-red px-4 py-2 text-white">Retry</button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <motion.svg width="64" height="64" viewBox="0 0 64 64" className="mx-auto text-brand-red">
          <motion.circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
          <motion.path d="M20 33l8 8 16-16" stroke="currentColor" strokeWidth="3" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.25 }} />
        </motion.svg>
        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
        <div className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2">
          <span className="text-sm text-muted-foreground">Booking reference</span>
          <span className="font-mono text-lg font-semibold">{booking.id}</span>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(booking.id);
              toast({ title: 'Copied!', description: 'Booking reference copied to clipboard.' });
            }}
            className="rounded p-1 hover:bg-muted"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Flight details</p>
            <p className="text-xl font-semibold">Your itinerary is confirmed and ticketed.</p>
          </div>
          <p className="text-2xl font-bold">{booking.currency} {booking.totalAmount.toFixed(2)}</p>
        </div>
        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl border p-3"><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{booking.status.toLowerCase()}</p></div>
          <div className="rounded-xl border p-3"><p className="text-muted-foreground">Payment</p><p className="font-medium capitalize">{booking.paymentStatus.toLowerCase()}</p></div>
          <div className="rounded-xl border p-3"><p className="text-muted-foreground">Booked on</p><p className="font-medium">{new Date(booking.createdAt).toLocaleString()}</p></div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">What's next</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[{ title: 'Download E-ticket', icon: Download }, { title: 'Add to Calendar', icon: CalendarPlus }, { title: 'Share Itinerary', icon: Share2 }].map(({ title, icon: Icon }) => (
            <div key={title} className="rounded-2xl border bg-card p-4 space-y-3">
              <Icon className="h-5 w-5 text-brand-red" />
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">Manage your booking and keep all travel details handy.</p>
              <button className="rounded-lg border px-3 py-1.5 text-sm">Open</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/my-trips" className="rounded-lg bg-brand-red text-white px-4 py-2">View My Trips</Link>
        <Link href="/hotels" className="rounded-lg border px-4 py-2">Book a Hotel</Link>
      </div>
    </section>
  );
}
