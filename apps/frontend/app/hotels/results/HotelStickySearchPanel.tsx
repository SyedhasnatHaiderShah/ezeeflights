"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchForm } from "@/components/hotels/SearchForm";
import { Bell, BellRing, Map, List } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  query: string;
}

export function HotelStickySearchPanel({
  city,
  checkInDate,
  checkOutDate,
  query,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40">
      <div className="max-w-[1440px] mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex-1 truncate text-foreground font-medium flex items-center gap-4">
            <p className="flex items-center gap-2">
              <span className="text-redmix font-black uppercase text-[10px] tracking-widest bg-redmix/10 px-2 py-0.5 rounded">Hotels</span>
              <span className="text-foreground font-bold">{city || "Anywhere"}</span> |{" "}
              <span className="text-muted-foreground">{checkInDate} to {checkOutDate}</span>
            </p>
            
            <div className="hidden md:flex items-center gap-3 border-l border-border pl-4">
               <Link
                href={`/hotels/map-view?${query}`}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-redmix transition-colors"
               >
                 <Map className="h-3.5 w-3.5" />
                 Map View
               </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={cn(
                "hidden sm:flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                isTracking 
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                  : "bg-slate-100 dark:bg-muted/50 text-slate-500 hover:bg-slate-200"
              )}
            >
              {isTracking ? <BellRing className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
              {isTracking ? "Tracking Prices" : "Track Prices"}
            </button>

            <button
              className="text-redmix font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:underline transition-all shrink-0"
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
              <SearchForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
