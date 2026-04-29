"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import {
  BriefcaseBusiness,
  Luggage,
  Download,
  Bell,
  Plane,
  ArrowRight,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TripCard } from "@/components/trips/TripCard";
import { useLoyaltyProfile } from "@/lib/api/loyalty";
import { useRecentSearches } from "@/lib/api/search";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

interface UserProfile {
  id: string;
  email: string;
  preferredCurrency: string;
  firstName?: string;
}
interface Booking {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  title?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  confirmationCode?: string;
  type?: "flight" | "hotel" | "package" | "car" | "transfer";
  createdAt?: string;
  updatedAt?: string;
}

export default function DashboardPage() {
  const session = useAuthSession();
  const profileQuery = useQuery({
    queryKey: ["profile", "bff"],
    queryFn: () => apiFetch<UserProfile>("/user/profile"),
    enabled: Boolean(session.data),
  });
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "bff"],
    queryFn: () => apiFetch<Booking[]>("/bookings/me"),
    enabled: Boolean(session.data),
  });
  const alertsQuery = useQuery({
    queryKey: ["price-alerts"],
    queryFn: () => apiFetch<any[]>("/notifications/price-alerts"),
    enabled: Boolean(session.data),
  });
  const loyaltyQuery = useLoyaltyProfile();
  const recentQuery = useRecentSearches(6, Boolean(session.data));

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const name =
    session.data?.firstName || profileQuery.data?.firstName || "Traveler";

  const mappedTrips = useMemo(
    () =>
      (bookingsQuery.data ?? []).map((b) => ({
        id: b.id,
        type: b.type ?? "flight",
        title: b.title ?? "Upcoming journey",
        subtitle: b.subtitle ?? "Manage your booking details",
        status: String(b.status).toLowerCase(),
        startDate: b.startDate ?? new Date().toISOString(),
        endDate: b.endDate ?? new Date(Date.now() + 86400000).toISOString(),
        confirmationCode: b.confirmationCode ?? b.id.slice(0, 8).toUpperCase(),
        currency: b.currency,
        total: b.totalAmount,
        createdAt: b.createdAt ?? new Date().toISOString(),
      })),
    [bookingsQuery.data],
  );

  const router = useRouter();

  if (session.isLoading)
    return <p className="rounded border bg-slate-50 p-4">Checking session…</p>;

  if (!session.data) {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-10 md:pt-24 pb-12">
        <div className="container max-w-7xl px-4 mx-auto">
          <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
            {/* Main Content */}
            <div className="space-y-10">
              {/* Hero Welcome Section */}
              <header className="relative overflow-hidden rounded-2xl bg-card p-4 md:p-8 text-white shadow-2xl border border-border/50">
                <div className="relative z-10">
                  <p className="text-white/70 font-medium mb-2  tracking-wider text-sm">
                    {now.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
                    {greeting},
                    <br />
                    {name} 👋
                  </h1>
                  <p className="mt-4 text-sm text-foreground max-w-md font-medium leading-relaxed">
                    Your next adventure is waiting. Where shall we take you
                    today?
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <div className="glass px-4 py-2 border border-redmix text-redmix rounded-full text-sm font-bold flex items-center gap-2">
                      <Luggage className="h-4 w-4" />
                      {mappedTrips.length} Active Trips
                    </div>
                    <div className="bg-brand-yellow/90 text-brand-dark-blue px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      {alertsQuery.data?.length ?? 0} Price Alerts
                    </div>
                  </div>
                </div>

                {/* Abstract Background Shapes */}
                {/* <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-64 w-64 rounded-full bg-white/10 blur-[80px]" /> */}
                {/* <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-64 w-64 rounded-full bg-white/10  blur-[80px]" /> */}
              </header>

              {/* Upcoming Trips Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                    Upcoming Trips
                    <span className="text-redmix text-xs font-bold bg-redmix/10 px-2 py-0.5 rounded-md">
                      {mappedTrips.length}
                    </span>
                  </h2>
                  <Link
                    href="/my-trips"
                    className="text-sm font-bold text-redmix hover:underline transition-all"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {mappedTrips.length > 0 ? (
                    mappedTrips.slice(0, 2).map((trip) => (
                      <div
                        key={trip.id}
                        className="relative transition-transform hover:scale-[1.02]"
                      >
                        <TripCard trip={trip as any} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-3xl border-2 border-dashed border-muted-foreground/20 p-12 text-center">
                      <Luggage className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground font-medium">
                        No upcoming trips found. Ready to explore?
                      </p>
                      <Link
                        href="/flights"
                        className="mt-4 inline-block bg-redmix text-white px-6 py-2 rounded-full font-bold"
                      >
                        Book a flight
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Quick Actions & Utility */}
              <div className="grid gap-10 md:grid-cols-2">
                <section className="space-y-4">
                  <h2 className="text-xl font-black tracking-tight">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        icon: BriefcaseBusiness,
                        label: "Manage Booking",
                        color: "bg-redmix",
                      },
                      {
                        icon: Luggage,
                        label: "Add Bags",
                        color: "bg-brand-dark-blue",
                      },
                      {
                        icon: Download,
                        label: "Get Tickets",
                        color: "bg-emerald-600",
                      },
                      {
                        icon: Bell,
                        label: "Notify Me",
                        color: "bg-redmix-dark",
                      },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="group flex flex-col items-start gap-3 md:gap-4 rounded-2xl md:rounded-3xl border border-border/50 bg-card p-4 md:p-6 text-left transition-all hover:shadow-xl hover:-translate-y-1"
                      >
                        <div
                          className={cn(
                            "rounded-2xl p-3 text-white transition-transform group-hover:scale-110",
                            item.color,
                          )}
                        >
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            One-tap access
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h2 className="text-xl font-black tracking-tight">
                    Recent Searches
                  </h2>
                  <div className="rounded-3xl border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="flex flex-wrap gap-2">
                      {(recentQuery.data ?? []).length > 0 ? (
                        (recentQuery.data ?? []).map((chip) => (
                          <Link
                            key={chip.id}
                            href={`/flights/results?org=${chip.origin}&des=${chip.destination}`}
                            className="group flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-bold shadow-sm transition-all hover:border-redmix hover:text-redmix hover:shadow-md"
                          >
                            <Plane className="h-4 w-4 text-muted-foreground group-hover:text-redmix" />
                            {chip.origin} <ArrowRight className="h-3 w-3" />{" "}
                            {chip.destination}
                          </Link>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Your recent search history will appear here.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-3">
              {/* Loyalty Status Card */}
              <div className="group relative overflow-hidden rounded-md bg-card p-5 text-white shadow-xl transition-all hover:shadow-2xl">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="h-10 w-10 rounded-full bg-redmix/10 flex items-center justify-center backdrop-blur-md">
                      <Gift className="h-5 w-5 text-redmix" />
                    </div>
                    <span className="rounded-full bg-redmix/10 px-4 py-1 text-xs font-bold tracking-widest text-redmix">
                      {(loyaltyQuery.data as any)?.tier ?? "Member"}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <p className="text-foreground text-sm font-bold  tracking-wider mb-1">
                      Available Points
                    </p>
                    <h3 className="text-4xl font-bold text-foreground tracking-tight">
                      {(
                        (loyaltyQuery.data as any)?.pointsBalance ?? 0
                      ).toLocaleString()}
                    </h3>
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <p className="text-xs font-semibold text-foreground">
                        Explore Rewards
                      </p>
                      <ArrowRight className="h-5 w-5 text-brand-yellow" />
                    </div>
                  </div>
                </div>

                {/* Background Glow */}
                {/* <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-primary/30 blur-[60px]" /> */}
              </div>

              {/* Price Alerts Widget */}
              <section className="rounded-md border bg-card/50 p-6 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black tracking-tight">
                    Price Alerts
                  </h2>
                  <Bell className="h-5 w-5 text-redmix" />
                </div>
                <div className="space-y-3">
                  {(alertsQuery.data ?? []).length > 0 ? (
                    (alertsQuery.data ?? []).slice(0, 3).map((a: any, i) => (
                      <div
                        key={a.id ?? i}
                        className="group relative rounded-2xl border bg-white p-4 transition-all hover:border-redmix/50 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-black text-sm">
                              {a.route || "Global Alert"}
                            </p>
                            <p className="text-[10px] font-bold text-redmix uppercase tracking-widest">
                              Target: ${a.targetPrice ?? "Best Deal"}
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-redmix/10 flex items-center justify-center text-redmix">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4 italic">
                      No active price alerts.
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
