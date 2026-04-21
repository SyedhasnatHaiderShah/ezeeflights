"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  Sparkles,
  Tag,
  Globe,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { listPackages, PackageSummary } from "@/lib/api/packages-api";
import { AppImage } from "@/components/ui/app-image";
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

// ─── Inclusion badge map ─────────────────────────────────────────────────────

const INCLUSION_ICONS = [
  { icon: Plane, label: "Flights" },
  { icon: Hotel, label: "Hotel" },
  { icon: Car, label: "Transfers" },
  { icon: Shield, label: "Insurance" },
];

// ─── Package skeleton ────────────────────────────────────────────────────────

function PackageSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-muted" />
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-8 w-28 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Package Card ────────────────────────────────────────────────────────────

function PackageCard({ item, index }: { item: PackageSummary; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-red/20"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <AppImage
          src={
            item.thumbnailUrl ||
            `https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1200`
          }
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        {item.status === "published" && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            <Sparkles className="h-2.5 w-2.5" />
            Featured
          </span>
        )}

        {/* Duration chip */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          {item.durationDays} days
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        {/* Country / destination */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 text-brand-red" />
          <span className="font-medium uppercase tracking-wide">
            {item.destination}, {item.country}
          </span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-brand-red transition-colors">
          {item.title}
        </h3>

        {/* Inclusions */}
        <div className="flex flex-wrap gap-1.5">
          {INCLUSION_ICONS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <Icon className="h-2.5 w-2.5" />
              {label}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">From</p>
            <p className="text-xl font-black text-foreground">
              {item.currency}{" "}
              <span className="text-brand-red">
                {item.basePrice.toLocaleString()}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground">per person</p>
          </div>

          <Link
            href={`/packages/${item.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-red/90 hover:gap-2.5 hover:shadow-md"
          >
            View Package
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Globe className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="text-lg font-semibold">No packages found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or check back soon for new packages.
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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["packages"],
    queryFn: () => listPackages(),
    staleTime: 1000 * 60 * 5,
  });

  // Client-side filter + sort
  const packages = React.useMemo(() => {
    let items: PackageSummary[] = data?.data ?? [];

    if (duration === "short") items = items.filter((p) => p.durationDays <= 5);
    else if (duration === "medium")
      items = items.filter((p) => p.durationDays >= 7 && p.durationDays <= 10);
    else if (duration === "long")
      items = items.filter((p) => p.durationDays >= 14);

    items = items.filter((p) => p.basePrice <= budget);

    if (sort === "price_asc") items = [...items].sort((a, b) => a.basePrice - b.basePrice);
    else if (sort === "price_desc")
      items = [...items].sort((a, b) => b.basePrice - a.basePrice);
    else if (sort === "duration")
      items = [...items].sort((a, b) => a.durationDays - b.durationDays);

    return items;
  }, [data, duration, budget, sort]);

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
            <p className="max-w-lg text-base text-white/80">
              Flights, stays, transfers and curated experiences bundled into one seamless booking. No hidden fees.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { label: "Destinations", value: "120+" },
                { label: "Happy Travellers", value: "50K+" },
                { label: "Best Price Guarantee", value: "✓" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-xs text-white/60">{label}</p>
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
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Duration
            </span>
            {DURATION_FILTERS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  duration === d.value
                    ? "border-brand-red bg-brand-red text-white shadow-sm"
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
                className="cursor-pointer appearance-none rounded-lg border border-border bg-background px-3 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* More filters toggle */}
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                showFilters
                  ? "border-brand-red bg-brand-red/10 text-brand-red"
                  : "border-border text-muted-foreground hover:border-brand-red/50"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2"
          >
            {/* Budget */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Max Budget
                </p>
                <span className="text-xs font-bold text-brand-red">
                  USD {budget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={10000}
                step={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer accent-brand-red"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>$500</span>
                <span>$10,000</span>
              </div>
            </div>

            {/* Theme */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Theme
              </p>
              <div className="flex flex-wrap gap-1.5">
                {THEME_FILTERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
                      theme === t
                        ? "border-brand-red bg-brand-red text-white"
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
          <h2 className="text-xl font-bold">
            {isLoading ? "Loading packages…" : `${packages.length} Package${packages.length !== 1 ? "s" : ""} Found`}
          </h2>
          <p className="text-sm text-muted-foreground">
            Handpicked bundles with everything included
          </p>
        </div>
        {isLoading && (
          <Loader2 className="h-5 w-5 animate-spin text-brand-red" />
        )}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      {isError ? (
        <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Unable to load packages right now. Please try again shortly.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <PackageSkeleton key={i} />
              ))
            : packages.length === 0
            ? <EmptyState />
            : packages.map((item, i) => (
                <PackageCard key={item.id} item={item} index={i} />
              ))}
        </div>
      )}

      {/* ── Load more ────────────────────────────────────────────── */}
      {!isLoading && packages.length > 0 && (
        <div className="flex justify-center pt-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-brand-red/40 hover:bg-brand-red/5 hover:text-brand-red">
            Load more packages
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Why bundle CTA ───────────────────────────────────────── */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Tag,
            title: "Save up to 40%",
            desc: "Bundle discounts applied automatically when you book a full package.",
          },
          {
            icon: Shield,
            title: "Free Cancellation",
            desc: "Cancel up to 24 hours before departure on most packages.",
          },
          {
            icon: Star,
            title: "Curated Experiences",
            desc: "Every package hand-picked by our travel experts for quality and value.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red/10">
              <Icon className="h-5 w-5 text-brand-red" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
