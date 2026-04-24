"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingForm } from "@/components/booking-form";

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  passengers: string;
  cabinClass: string;
}

export function StickySearchPanel({
  origin,
  destination,
  departureDate,
  passengers,
  cabinClass,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40">
      <div className="max-w-[1240px] mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-2 text-sm">
          <p className="truncate text-foreground font-medium">
            <span className="text-foreground">{origin}</span> →{" "}
            <span className="text-foreground">{destination}</span> |{" "}
            {departureDate} | {passengers} | {cabinClass}
          </p>
          <button
            className="text-redmix font-semibold cursor-pointer hover:underline transition-all shrink-0"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Close" : "Edit Search"}
          </button>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 pb-4 overflow-hidden"
            >
              <BookingForm heroMode={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
