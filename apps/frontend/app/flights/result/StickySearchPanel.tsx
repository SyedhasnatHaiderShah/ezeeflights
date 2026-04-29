"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookingForm } from "@/components/booking-form";
import { Bell, BellRing, DollarSign, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isTracking, setIsTracking] = useState(false);

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40">
      <div className="max-w-[1240px] mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex-1 truncate text-foreground font-medium flex items-center gap-4">
            <p>
              <span className="text-foreground">{origin}</span> →{" "}
              <span className="text-foreground">{destination}</span> |{" "}
              {departureDate} | {passengers} | {cabinClass}
            </p>
            
            <div className="hidden md:flex items-center gap-3 border-l border-border pl-4">
               <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                 <Globe className="h-3 w-3" />
                 Simultaneous: $450 | €415 | AED 1,650
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                isTracking 
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {isTracking ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
              {isTracking ? "Tracking Prices" : "Track Prices"}
            </button>

            <button
              className="text-redmix font-semibold cursor-pointer hover:underline transition-all shrink-0"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Close" : "Edit Search"}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 pb-0 rounded-2xl overflow-hidden"
            >
              <BookingForm heroMode={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
