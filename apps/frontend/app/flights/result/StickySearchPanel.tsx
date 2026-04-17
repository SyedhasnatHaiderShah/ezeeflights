"use client";

import { useState } from "react";
import { BookingForm } from "@/components/booking-form";

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  passengers: string;
  cabinClass: string;
}

export function StickySearchPanel({ origin, destination, departureDate, passengers, cabinClass }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40">
      <div className="max-w-[1240px] mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <p className="truncate">{origin} → {destination} | {departureDate} | {passengers} | {cabinClass}</p>
          <button className="text-brand-red font-medium" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Close" : "Edit Search"}
          </button>
        </div>
        {expanded && <BookingForm />}
      </div>
    </div>
  );
}
