"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Hotel,
  Car,
  Shield,
  Clock,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Tag,
  Globe,
  Loader2,
} from "lucide-react";
import { mockPackages, MockPackage } from "@/data/mock-packages";
import { PackageCard } from "./PackageCard";
import { cn } from "@/lib/utils";

// ─── Filter types ────────────────────────────────────────────────────────────

const DURATION_FILTERS = [
  { label: "Any", value: "" },
  { label: "3–5 Days", value: "short" },
  { label: "7–10 Days", value: "medium" },
  { label: "14+ Days", value: "long" },
];

const THEME_FILTERS = [
  "All Themes",
  "Adventure",
  "Family",
  "Luxury",
  "Honeymoon",
  "Cultural",
  "Beach",
];

const SORT_OPTIONS = [
  { label: "Best Match", value: "match" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Duration", value: "duration" },
];

// ─── Package skeleton ────────────────────────────────────────────────────────

function PackageSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md animate-pulse">
      <div className="aspect-[16/11] bg-muted" />
      <div className="space-y-4 p-6">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="flex items-center justify-between pt-4">
          <div className="h-8 w-24 rounded bg-muted" />
          <div className="h-10 w-28 rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-6 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-muted/50 backdrop-blur-sm border border-border/50">
        <Globe className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <p className="text-xl font-bold">No packages found</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">
          Try adjusting your filters or search for a different destination.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PackagesContent() {
  const [duration, setDuration] = React.useState("");
  const [budget, setBudget] = React.useState(10000);
  const [theme, setTheme] = React.useState("All Themes");
  const [sort, setSort] = React.useState("match");
  const [showFilters, setShowFilters] = React.useState(false);

  // Use mock data instead of API for feature demonstration
  const isLoading = false;
  const isError = false;
  const data = { data: mockPackages };

  // Client-side filter + sort
  const packages = React.useMemo(() => {
    let items: MockPackage[] = data?.data ?? [];

    if (duration === "short") items = items.filter((p) => p.durationDays <= 5);
    else if (duration === "medium")
      items = items.filter((p) => p.durationDays >= 7 && p.durationDays <= 10);
    else if (duration === "long")
      items = items.filter((p) => p.durationDays >= 14);

    items = items.filter((p) => p.basePrice <= budget);
    
    if (theme !== "All Themes") {
      items = items.filter((p) => p.themes.includes(theme));
    }

    if (sort === "price_asc") items = [...items].sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === "price_desc")
      items = [...items].sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === "duration")
      items = [...items].sort((a, b) => a.durationDays - b.durationDays);

    return items;
  }, [data, duration, budget, sort, theme]);

  return (
    <div className="space-y-8 pb-16">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-[url('/logos-banner-new.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-brand-red/30" />
        <div className="relative z-10 px-8 py-16 md:px-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl space-y-5"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              <Tag className="h-3 w-3 text-brand-yellow" />
              Best Value Packages · Save up to 40%
            </span>
            <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
              Complete Travel{" "}
              <span className="text-brand-yellow">Packages</span>
            </h1>
            <p className="max-w-lg text-base text-white/80 font-medium">
              Flights, stays, transfers and curated experiences bundled into one seamless booking. Itemised savings displayed on every package.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { label: "Destinations", value: "120+" },
                { label: "Happy Travellers", value: "50K+" },
                { label: "Group Discount", value: "10%" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-white/60 font-bold uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* Top row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Duration pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mr-2">
              Stay Duration
            </span>
            {DURATION_FILTERS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
                  duration === d.value
                    ? "border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/20"
                    : "border-border text-muted-foreground hover:border-brand-red/50 hover:text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer appearance-none rounded-lg border border-border bg-background pl-4 pr-10 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* More filters toggle */}
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition-all",
                showFilters
                  ? "border-brand-red bg-brand-red/10 text-brand-red"
                  : "border-border text-muted-foreground hover:border-brand-red/50"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Advanced
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid gap-6 border-t border-border pt-6 sm:grid-cols-2"
          >
            {/* Budget */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Maximum Budget
                </p>
                <span className="text-sm font-black text-brand-red">
                  AED {budget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-brand-red"
              />
              <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>AED 500</span>
                <span>AED 10,000</span>
              </div>
            </div>

            {/* Theme */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Package Theme
              </p>
              <div className="flex flex-wrap gap-2">
                {THEME_FILTERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                      theme === t
                        ? "border-brand-red bg-brand-red/5 text-brand-red shadow-sm"
                        : "border-border text-muted-foreground hover:border-brand-red/50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Results header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            {isLoading ? "Curating best bundles…" : `${packages.length} Handpicked Bundle${packages.length !== 1 ? "s" : ""} Available`}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Bundled deals with Flights + Hotels + Transfers
          </p>
        </div>
        {isLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
        )}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      {isError ? (
        <div className="col-span-full rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
          <p className="text-sm font-bold text-red-600 uppercase tracking-widest">
            Service Unavailable. Please try again later.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PackageSkeleton key={i} />
              ))
            : packages.length === 0
            ? <EmptyState />
            : packages.map((item, i) => (
                <PackageCard key={item.id} item={item} />
              ))}
        </div>
      )}

      {/* ── Load more ────────────────────────────────────────────── */}
      {!isLoading && packages.length > 0 && (
        <div className="flex justify-center pt-6">
          <button className="group inline-flex items-center gap-3 rounded-full border border-border bg-card px-10 py-4 text-xs font-black uppercase tracking-widest text-foreground shadow-sm transition-all hover:border-brand-red/40 hover:bg-brand-red/5 hover:text-brand-red">
            Discover More
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
          </button>
        </div>
      )}

      {/* ── Why bundle CTA ───────────────────────────────────────── */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {[
          {
            icon: Tag,
            title: "Guaranteed Savings",
            desc: "We bundle high-volume inventory to save you up to 40% vs. booking separately.",
            color: "bg-emerald-50 text-emerald-600"
          },
          {
            icon: Shield,
            title: "100% Verified",
            desc: "Every hotel and transfer partner is manually vetted by our destination experts.",
            color: "bg-blue-50 text-blue-600"
          },
          {
            icon: Star,
            title: "Flexible Customization",
            desc: "Swap hotels or adjust flight times within any pre-built package effortlessly.",
            color: "bg-amber-50 text-amber-600"
          },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div
            key={title}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-brand-red/10"
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", color)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed font-medium">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
