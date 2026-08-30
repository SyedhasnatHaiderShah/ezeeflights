"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Plane,
  Hotel,
  Car,
  Gift,
  Clock,
  ArrowRight,
  Luggage,
  Bell,
} from "lucide-react";
import { TripCard } from "@/components/trips/TripCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface UserDashboardProps {
  name: string;
  greeting: string;
  loyaltyPoints: number;
  trips: any[];
  alerts: any[];
  isLoading: boolean;
}

export function UserDashboard({
  name,
  greeting,
  loyaltyPoints,
  trips,
  alerts,
  isLoading,
}: UserDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-5 w-36 bg-muted/60" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-36 rounded-2xl bg-muted/60" />
              <Skeleton className="h-36 rounded-2xl bg-muted/60" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 bg-muted/60" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-28 rounded-2xl bg-muted/60" />
              <Skeleton className="h-28 rounded-2xl bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-redmix font-bold tracking-widest text-xs mb-1">
            Personal Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tighter text-foreground leading-none">
            {greeting}, {name} 👋
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border shadow-sm">
            <Gift className="h-5 w-5 text-redmix" />
            <div>
              <p className="text-xs font-semibold text-foreground/70 tracking-wider">
                Loyalty Points
              </p>
              <p className="text-xs font-bold text-foreground">
                {loyaltyPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Luggage className="h-4 w-4 text-redmix" />
              Your Recent Trips
            </h2>
            <Button
              variant="link"
              className="text-xs font-bold text-redmix p-0 h-auto"
            >
              View All
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {trips.length > 0 ? (
              trips
                .slice(0, 2)
                .map((trip) => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <div className="col-span-2 bg-muted/30 rounded-2xl p-8 border border-dashed border-border flex flex-col items-center justify-center text-center">
                <p className="text-sm text-muted-foreground font-medium mb-4">
                  No upcoming trips found
                </p>
                <Button
                  variant="outline"
                  className="rounded-full text-xs font-bold px-6"
                >
                  Book Your First Trip
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Alerts & Actions */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-redmix" />
              Price Alerts
            </h2>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert, i) => (
                  <div
                    key={i}
                    className="bg-card p-3 rounded-xl border border-border shadow-sm flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-lg bg-redmix/10 text-redmix flex items-center justify-center">
                      <TrendingUp size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                        Flight Alert
                      </p>
                      <p className="text-xs font-bold text-foreground leading-tight">
                        {alert.route || "London to Dubai"}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        Price dropped to $450
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No active price alerts
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1">Exclusive Deals</h3>
              <p className="text-white/60 text-[11px] leading-relaxed">
                As a member, access special rates on 500,000+ hotels.
              </p>
              <Button className="mt-4 bg-redmix hover:bg-red-600 text-white rounded-full px-6 h-8 font-bold text-[10px] tracking-widest">
                EXPLORE NOW
              </Button>
            </div>
            <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-redmix/20 blur-2xl rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

import { TrendingUp } from "lucide-react";
