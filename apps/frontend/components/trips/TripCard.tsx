import Link from "next/link";
import {
  Calendar,
  Plane,
  Download,
  Settings,
  CheckSquare,
  Hotel,
  Car,
  Gift,
  Navigation,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { TripSummary } from "@/lib/api/trips";
import { cn } from "@/lib/utils";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import React from "react";

const statusColors: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  confirmed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    border: "border-emerald-500/20",
  },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    border: "border-amber-500/20",
  },
  completed: {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-500",
    border: "border-slate-500/20",
  },
  cancelled: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    border: "border-rose-500/20",
  },
  default: {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-500",
    border: "border-slate-500/20",
  },
};

const actionItems = [
  { label: "Manage", Icon: Settings },
  { label: "Download", Icon: Download },
  { label: "Check-in", Icon: CheckSquare },
] as const;

const typeIcons: Record<TripSummary["type"], LucideIcon> = {
  flight: Plane,
  hotel: Hotel,
  package: Gift,
  car: Car,
  transfer: Navigation,
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDateRange(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} — ${end}`;
  }
  return `${dateFormatter.format(startDate)} — ${dateFormatter.format(endDate)}`;
}

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusColors[status] ?? statusColors.default;
  const label = status.replace(/-/g, " ");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-all",
        config.bg,
        config.text,
        config.border,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {label}
    </div>
  );
};

export function TripCard({ trip }: { trip: TripSummary }) {
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currentCurrency = SUPPORTED_CURRENCIES[baseCurrency];
  const isUpcoming = new Date(trip.startDate).getTime() > Date.now();
  const TypeIcon = typeIcons[trip.type] ?? Plane;

  const amount = React.useMemo(() => {
    const val =
      typeof trip.total === "number"
        ? trip.total
        : parseFloat(trip.total as any) || 0;
    if (isNaN(val)) return `${currentCurrency.symbol}0`;

    const converted = getConvertedAmount(
      val,
      (trip.currency || "USD") as any,
      baseCurrency,
    );
    return `${currentCurrency.symbol}${Math.round(converted).toLocaleString()}`;
  }, [
    trip.total,
    trip.currency,
    baseCurrency,
    getConvertedAmount,
    currentCurrency,
  ]);

  // Try to split title if it's a flight path
  const titleParts = (trip.title || "").split("→").map((s) => s.trim());
  const hasPath = titleParts.length === 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link
        href={`/my-trips/${trip.id}`}
        className="block relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-border/50 bg-card p-4 xs:p-6 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-primary/20 dark:hover:bg-accent/5"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
        <div className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

        <div className="relative z-10 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-redmix/10 text-redmix transition-all duration-300 group-hover:bg-redmix group-hover:text-white group-hover:rotate-6 group-hover:scale-110">
                <TypeIcon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {hasPath ? (
                    <div className="flex items-center gap-2 text-base md:text-lg font-bold tracking-tight text-foreground">
                      <span>{titleParts[0]}</span>
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-redmix group-hover:translate-x-1 transition-transform" />
                      <span>{titleParts[1]}</span>
                    </div>
                  ) : (
                    <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                      {trip.title || "Untitled Trip"}
                    </h3>
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  REF: {trip.confirmationCode}
                </p>
              </div>
            </div>
            <StatusBadge status={trip.status} />
          </div>

          {/* Subtitle / Description */}
          {trip.subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {trip.subtitle}
            </p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-6 bg-muted/30 rounded-xl md:rounded-2xl p-4 transition-colors group-hover:bg-muted/50">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Travel Dates
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-redmix" />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Total Cost
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-redmix animate-pulse" />
                <span>{amount}</span>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between border-t border-border/40 pt-4 xs:pt-5 gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 items-center gap-2 rounded-full px-4 text-[10px] font-bold uppercase tracking-wider transition-all",
                  isUpcoming
                    ? "bg-redmix/10 text-redmix"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isUpcoming ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-redmix opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-redmix"></span>
                    </span>
                    Upcoming
                  </>
                ) : (
                  "Past Trip"
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground/50">
                Updated{" "}
                {trip.createdAt && !isNaN(new Date(trip.createdAt).getTime())
                  ? dateFormatter.format(new Date(trip.createdAt))
                  : "Recently"}
              </span>
            </div>

            <div className="flex -space-x-1.5">
              {actionItems.map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:z-20 hover:border-redmix/50 hover:text-redmix hover:-translate-y-1 hover:scale-110 cursor-pointer"
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
