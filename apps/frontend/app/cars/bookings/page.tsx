'use client';

import { CarExtrasPanel } from '@/components/cars/CarExtrasPanel';

/** My Car Bookings list disabled — bookings show inline confirmation after checkout. */
export default function CarBookingsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">My Car Bookings</h1>
      <p className="text-sm text-muted-foreground">
        Car booking history is not shown here yet. Your reference appears on the confirmation screen after booking.
      </p>
      <CarExtrasPanel />
    </section>
  );
}
