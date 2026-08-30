"use client";

import dynamic from "next/dynamic";

const BookingForm = dynamic(
  () => import("@/components/booking-form").then((m) => m.BookingForm),
  { ssr: false }
);

export function HotelSearchContainer() {
  return (
    <section className="space-y-4">
      <div className="rounded-[20px] border border-border/50 bg-background/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70 sm:p-6">
        <BookingForm defaultTab="hotels" heroMode={false} animateIn={false} />
      </div>
    </section>
  );
}
