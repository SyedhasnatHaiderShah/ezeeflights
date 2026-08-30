"use client";

import {
  TrendingUp,
  CheckCircle2,
  Users,
  Clock,
  Plane,
  Hotel,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@/lib/store/currency-store";

interface AdminDashboardStatsProps {
  kpiData:
    | {
        totalRevenue: string;
        totalBookings: string;
        totalUsers: string;
        totalFlights: string;
        totalHotels: string;
        totalCars: string;
        conversionRate: string;
      }
    | undefined;
  isLoading?: boolean;
}

const USD = SUPPORTED_CURRENCIES.USD;

function formatUsdAmount(value: string | undefined): string {
  const amount = Number(value) || 0;
  const rounded = Math.round(amount * 100) / 100;
  return `${USD.symbol} ${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function AdminDashboardStats({
  kpiData,
  isLoading,
}: AdminDashboardStatsProps) {
  const mainStats = [
    {
      label: "Total Revenue",
      value: formatUsdAmount(kpiData?.totalRevenue),
      icon: TrendingUp,
      iconBg:
        "bg-gradient-to-br from-rose-400 to-redmix text-white shadow-lg shadow-redmix/30",
      glow: "text-redmix",
    },
    {
      label: "Confirmed Bookings",
      value: kpiData?.totalBookings || "0",
      icon: CheckCircle2,
      iconBg:
        "bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30",
      glow: "text-indigo-500",
    },
    {
      label: "Total Customers",
      value: kpiData?.totalUsers || "0",
      icon: Users,
      iconBg:
        "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30",
      glow: "text-orange-500",
    },
  ];

  const moduleStats = [
    {
      label: "Flights",
      value: kpiData?.totalFlights || "0",
      icon: Plane,
      iconBg:
        "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-blue-500/20",
    },
    {
      label: "Hotels",
      value: kpiData?.totalHotels || "0",
      icon: Hotel,
      iconBg:
        "bg-gradient-to-br from-purple-400 to-fuchsia-600 text-white shadow-md shadow-purple-500/20",
    },
    {
      label: "Cars",
      value: kpiData?.totalCars || "0",
      icon: Car,
      iconBg:
        "bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-md shadow-emerald-500/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card p-2.5 sm:p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-3 animate-pulse text-center sm:text-left"
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-muted" />
              <div className="space-y-1.5 flex-1 w-full flex flex-col items-center sm:items-start">
                <div className="h-2.5 w-16 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card p-2.5 sm:p-4 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-3 animate-pulse text-center sm:text-left"
            >
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-muted" />
              <div className="space-y-1.5 flex-1 w-full flex flex-col items-center sm:items-start">
                <div className="h-2.5 w-12 bg-muted rounded" />
                <div className="h-4 w-8 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {mainStats.map((s) => (
          <div
            key={s.label}
            className="bg-card/80 backdrop-blur-xl p-2.5 sm:p-4 rounded-2xl border border-white/40 dark:border-border shadow-sm shadow-black/[0.02] flex flex-col sm:flex-row items-center gap-2 sm:gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Subtle background glow */}
            <div
              className={cn(
                "absolute -right-8 -top-8 w-32 h-32 opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity duration-500",
                s.glow,
              )}
            />

            <div
              className={cn(
                "h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 z-10",
                s.iconBg,
              )}
            >
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="text-center sm:text-left min-w-0 z-10">
              <p className="text-xs font-semibold text-foreground tracking-widr mb-0.5">
                {s.label}
              </p>
              <p className="text-sm font-semibold text-foreground tracking-tight truncate drop-shadow-sm">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {moduleStats.map((s) => (
          <div
            key={s.label}
            className="bg-card/80 backdrop-blur-xl p-2.5 sm:p-4 rounded-2xl border border-white/40 dark:border-border shadow-sm shadow-black/[0.02] flex flex-col sm:flex-row items-center gap-2 sm:gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div
              className={cn(
                "h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12",
                s.iconBg,
              )}
            >
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="text-center sm:text-left min-w-0">
              <p className="text-xs font-semibold text-foreground tracking-widr mb-0.5">
                {s.label}
              </p>
              <p className="text-sm font-semibold text-foreground tracking-tight truncate drop-shadow-sm">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
