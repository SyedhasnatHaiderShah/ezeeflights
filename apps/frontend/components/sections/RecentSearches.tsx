"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Hotel,
  Car,
  Package,
  Search,
  ArrowRight,
  Clock,
  Users,
  Plus,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "../ui/app-icon";

interface MockSearch {
  id: number;
  type: string;
  icon: LucideIcon;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  dates: string;
  travelers: string;
  class: string;
  tripType: string;
  price: string;
  tag: string;
  accent: string;
  accentText: string;
}

const MOCK_SEARCHES: MockSearch[] = [
  {
    id: 1,
    type: "flight",
    icon: Plane,
    origin: "SIN",
    originCity: "Singapore",
    destination: "LGK",
    destinationCity: "Langkawi",
    dates: "Mon 5/11 — Fri 5/15",
    travelers: "1 traveler",
    class: "Economy",
    tripType: "Round-trip",
    price: "$79",
    tag: "Best deal",
    accent: "#E8F4FF",
    accentText: "#1c2652", // brand-blue
  },
  {
    id: 2,
    type: "flight",
    icon: Plane,
    origin: "SIN",
    originCity: "Singapore",
    destination: "MKZ",
    destinationCity: "Malacca",
    dates: "Sun 5/24 — Fri 5/29",
    travelers: "1 traveler",
    class: "Economy",
    tripType: "Round-trip",
    price: "$77",
    tag: "Price drop",
    accent: "#fef2f2", // brand-red light tint
    accentText: "#c52a28", // brand-red
  },
];

const CATEGORIES = [
  { id: "flights", icon: Plane, label: "Flights" },
  { id: "stays", icon: Hotel, label: "Stays" },
  { id: "cars", icon: Car, label: "Cars" },
  { id: "packages", icon: Package, label: "Packages" },
];

export function RecentSearches() {
  return (
    <div className="w-full mt-8 lg:mt-12 h-auto md:min-h-[40dvh]  animate-in fade-in duration-700 md:pb-20 pb-5 lg:pb-0">
      <div className="flex items-baseline justify-between mb-6 lg:mb-8 px-1">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-foreground">
          Recent searches
        </h2>
      </div>

      <div className="flex flex-col gap-4 lg:gap-5">
        {MOCK_SEARCHES.map((search, index) => (
          <motion.div
            key={search.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.5, ease: "easeOut" }}
            className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-red/20 hover:bg-muted/30 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 px-4 py-4 lg:px-6 lg:py-5 relative z-10">
              <div className="flex items-center gap-4 lg:gap-6 flex-1">
                <AppIcon
                  icon={search.icon}
                  isActive={true}
                  isFill={true}
                  className="w-10 h-10 lg:w-11 lg:h-11 shrink-0"
                />

                {/* Route */}
                <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1 lg:mb-2 truncate">
                      {search.originCity}
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-foreground tracking-tighter leading-none">
                      {search.origin}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
                    <div className="w-6 lg:w-10 h-0.5 bg-border rounded-full" />
                    <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] lg:text-xs font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1 lg:mb-2 truncate">
                      {search.destinationCity}
                    </p>
                    <p className="text-xl lg:text-2xl font-bold text-foreground tracking-tighter leading-none">
                      {search.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* MD+ Meta (Horizontally) */}
              <div className="hidden md:flex flex-col gap-1 flex-1 border-l border-border/50 pl-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="truncate">{search.dates}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">
                    {search.travelers} · {search.class}
                  </span>
                </div>
              </div>

              {/* Mobile-only Meta (Inline) */}
              <div className="flex md:hidden items-center gap-3 py-2 border-t border-border/30">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{search.dates}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Users className="w-3 h-3" />
                  <span>{search.travelers}</span>
                </div>
              </div>

              {/* Price + Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 lg:gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-border/30">
                <div className="text-left sm:text-right">
                  <p className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter leading-none">
                    {search.price}
                  </p>
                  <p className="text-[10px] font-bold text-brand-red uppercase tracking-wider mt-1 opacity-80">
                    {search.tag}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-tl from-brand-red to-brand-red-light shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 transition-all shrink-0"
                >
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* New Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="relative bg-muted/20 border border-dashed border-border rounded-2xl p-4 lg:px-6 lg:py-4 transition-all duration-300 group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-red" />
              <p className="text-[13px] text-muted-foreground font-bold uppercase tracking-wider">
                Start new
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <AppIcon
                  key={cat.id}
                  icon={cat.icon}
                  label={cat.label}
                  isFill={false}
                  className="h-10 sm:h-9 px-3.5 text-[12px] bg-card border-border hover:border-brand-red/50 transition-all shadow-sm w-full sm:w-auto"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
