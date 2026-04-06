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
    <div className="w-full mt-12 h-auto min-h-[60dvh] animate-in fade-in duration-700">
      <div className="flex items-baseline justify-between mb-8 px-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Recent searches
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_SEARCHES.map((search, index) => (
          <motion.div
            key={search.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * index, duration: 0.5, ease: "easeOut" }}
            className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-brand-red/10 hover:bg-brand-red/[0.02] hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300"
          >
            <div className="flex items-center gap-6 px-6 py-5">
              {/* Icon */}
              <div className="w-11 h-11 rounded-full bg-redmix flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300">
                <search.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>

              {/* Route */}
              <div className="flex items-center gap-4 min-w-[240px]">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em] leading-none mb-1.5 lg:mb-2 text-wrap">
                    {search.originCity}
                  </p>
                  <p className="text-2xl font-semibold text-foreground tracking-tighter leading-none">
                    {search.origin}
                  </p>
                </div>

                <div className="flex items-center gap-2 px-1">
                  <div className="w-10 h-0.5 bg-border rounded-full" />
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em] leading-none mb-1.5 lg:mb-2 text-wrap">
                    {search.destinationCity}
                  </p>
                  <p className="text-2xl font-semibold text-foreground tracking-tighter leading-none">
                    {search.destination}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-[1.5px] h-10 bg-border mx-2" />

              {/* Meta */}
              <div className="hidden md:flex flex-col gap-1.5 flex-1 pl-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{search.dates}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {search.travelers} · {search.class} · {search.tripType}
                  </span>
                </div>
              </div>

              {/* Price + tag */}
              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                  <p className="text-3xl font-black text-foreground tracking-tighter leading-none">
                    {search.price}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-tl from-brand-red to-brand-red-light shadow-lg shadow-brand-red/20 hover:shadow-brand-red/40 transition-all shrink-0"
                >
                  <Search className="w-5 h-5" strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* New Search card - Standardized & Compact */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="relative bg-muted/20 border border-dashed border-border rounded-2xl px-6 py-4 flex items-center justify-between hover:bg-brand-red/[0.01] hover:border-brand-red/20 transition-all duration-300 group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-[13px] text-muted-foreground font-bold uppercase tracking-wider whitespace-nowrap">
              Start new
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={cat.label}
                  className="flex items-center gap-2 bg-card border border-border text-foreground text-[13px] font-bold rounded-xl px-3.5 py-2 hover:border-brand-red/50 hover:text-brand-red transition-all shadow-sm active:shadow-inner"
                >
                  <cat.icon className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground group-hover:bg-brand-red/10 group-hover:text-brand-red transition-all">
            <Plus className="w-5 h-5" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
