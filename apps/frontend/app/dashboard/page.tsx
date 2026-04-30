"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { adminFetch } from "@/lib/api/admin-api";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import {
  BriefcaseBusiness,
  Luggage,
  Download,
  Bell,
  Plane,
  ArrowRight,
  Gift,
  Users,
  Hotel,
  Car,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TripCard } from "@/components/trips/TripCard";
import { useLoyaltyProfile } from "@/lib/api/loyalty";
import { useRecentSearches } from "@/lib/api/search";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { useEffect } from "react";
import { Lock } from "lucide-react";

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

interface DashboardData {
  kpi: {
    totalRevenue: string;
    totalBookings: string;
    totalUsers: string;
    totalFlights: string;
    totalHotels: string;
    totalCars: string;
    conversionRate: string;
  };
  charts: {
    bookingsTrend: { date: string; value: string }[];
    revenueTrend: { date: string; value: string }[];
    usersTrend: { date: string; value: string }[];
    cancellations: { date: string; value: string }[];
  };
}

export default function DashboardPage() {
  const session = useAuthSession();
  const isAdmin = useMemo(() => {
    return (
      session.data?.roles?.some((r) => r.toLowerCase() === "admin") ?? false
    );
  }, [session.data?.roles]);

  const profileQuery = useQuery({
    queryKey: ["profile", "bff"],
    queryFn: () => apiFetch<UserProfile>("/user/profile"),
    enabled: Boolean(session.data),
  });

  const bookingsQuery = useQuery({
    queryKey: ["bookings", "bff"],
    queryFn: () => apiFetch<Booking[]>("/bookings/me"),
    enabled: Boolean(session.data) && !isAdmin,
  });

  const adminDashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminFetch<DashboardData>("/dashboard"),
    enabled: Boolean(session.data) && isAdmin,
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
  const { open: openAuth } = useAuthModalStore();

  useEffect(() => {
    if (!session.isLoading && !session.data) {
      openAuth("login");
    }
  }, [session.isLoading, session.data, openAuth]);

  if (session.isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-redmix animate-spin" />
          <p className="text-muted-foreground font-bold">
            Initializing your dashboard...
          </p>
        </div>
      </div>
    );


  if (!session.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-24 px-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-[2.5rem] bg-card border border-border shadow-2xl">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-redmix/10 flex items-center justify-center text-redmix">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tighter">Session Required</h2>
              <p className="text-muted-foreground text-sm font-medium">
                Please sign in to access your personal dashboard and manage your bookings.
              </p>
            </div>
            <Button 
              onClick={() => openAuth("login")}
              className="w-full bg-redmix hover:bg-redmix/90 text-white rounded-xl h-12 font-bold"
            >
              Sign In Now
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const kpiData = adminDashboardQuery.data?.kpi;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 1. Compact Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-redmix font-black uppercase tracking-widest text-[10px] mb-1">
                {isAdmin ? "Administrator Portal" : "Personal Dashboard"}
              </p>
              <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">
                {greeting}, {name} 👋
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-xl border border-border shadow-sm">
                <Gift className="h-4 w-4 text-redmix" />
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Loyalty Points
                  </p>
                  <p className="text-[11px] font-black text-foreground">
                    {(
                      (loyaltyQuery.data as any)?.pointsBalance ?? 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3 bg-card px-3 py-2 rounded-xl border border-border shadow-sm">
                  <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center text-background">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      System
                    </p>
                    <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                      Active
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Personal Quick Overview (Trips & Alerts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Upcoming Trips
                </h2>
                <Link
                  href="/my-trips"
                  className="text-[10px] font-black text-redmix uppercase tracking-widest hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {mappedTrips.length > 0 ? (
                  mappedTrips
                    .slice(0, 2)
                    .map((trip) => (
                      <TripCard key={trip.id} trip={trip as any} />
                    ))
                ) : (
                  <div className="col-span-full border border-dashed border-border bg-card/50 rounded-2xl p-6 text-center">
                    <p className="text-xs font-bold text-muted-foreground">
                      No upcoming trips found. Ready to explore?
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Bell,
                    label: "Alerts",
                    color: "text-amber-500",
                    bg: "bg-amber-500/10",
                  },
                  {
                    icon: Download,
                    label: "Tickets",
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all gap-2"
                  >
                    <div className={cn("p-2 rounded-xl", item.bg, item.color)}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-wider">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Administrative Tabs (Only for Admins) */}
          {isAdmin ? (
            <div className="space-y-6 pt-4 border-t border-border">
              <Tabs defaultValue="overview" className="space-y-8">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-muted p-0.5 rounded-xl border border-border h-10">
                    <TabsTrigger
                      value="overview"
                      className="rounded-lg px-6 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-redmix font-black transition-all h-[34px]"
                    >
                      Platform Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="users"
                      className="rounded-lg px-6 py-1.5 text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-redmix font-black transition-all h-[34px]"
                    >
                      User Management
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="overview"
                  className="space-y-8 outline-none"
                >
                  {/* Admin KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Revenue",
                        value: `$${parseFloat(kpiData?.totalRevenue || "0").toLocaleString()}`,
                        icon: TrendingUp,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-500/10",
                      },
                      {
                        label: "Active Users",
                        value: kpiData?.totalUsers || "0",
                        icon: Users,
                        color: "text-blue-600 dark:text-blue-400",
                        bg: "bg-blue-500/10",
                      },
                      {
                        label: "Total Bookings",
                        value: kpiData?.totalBookings || "0",
                        icon: Luggage,
                        color: "text-purple-600 dark:text-purple-400",
                        bg: "bg-purple-500/10",
                      },
                      {
                        label: "Conversion Rate",
                        value: `${kpiData?.conversionRate || "0"}%`,
                        icon: BriefcaseBusiness,
                        color: "text-redmix",
                        bg: "bg-redmix/10",
                      },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="group bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={cn(
                              "p-2.5 rounded-xl",
                              kpi.bg,
                              kpi.color,
                            )}
                          >
                            <kpi.icon className="h-5 w-5" />
                          </div>
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            +12%
                          </span>
                        </div>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider mb-0.5">
                          {kpi.label}
                        </p>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                          {kpi.value}
                        </h3>
                      </div>
                    ))}
                  </div>

                  {/* Module-specific Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Flights",
                        value: kpiData?.totalFlights || "0",
                        icon: Plane,
                        color: "text-blue-500",
                      },
                      {
                        label: "Hotels",
                        value: kpiData?.totalHotels || "0",
                        icon: Hotel,
                        color: "text-amber-500",
                      },
                      {
                        label: "Cars",
                        value: kpiData?.totalCars || "0",
                        icon: Car,
                        color: "text-emerald-500",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3"
                      >
                        <div
                          className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center",
                            stat.color.replace("text", "bg") + "/10",
                          )}
                        >
                          <stat.icon className={cn("h-5 w-5", stat.color)} />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            {stat.label}
                          </p>
                          <p className="text-xl font-black text-foreground tracking-tight">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts Section */}
                  {adminDashboardQuery.data && (
                    <DashboardCharts
                      revenueTrend={
                        adminDashboardQuery.data.charts.revenueTrend
                      }
                      usersTrend={adminDashboardQuery.data.charts.usersTrend}
                      bookingsByCategory={[
                        {
                          name: "Flights",
                          value: parseInt(kpiData?.totalFlights || "0"),
                          color: "#3b82f6",
                        },
                        {
                          name: "Hotels",
                          value: parseInt(kpiData?.totalHotels || "0"),
                          color: "#f59e0b",
                        },
                        {
                          name: "Cars",
                          value: parseInt(kpiData?.totalCars || "0"),
                          color: "#10b981",
                        },
                      ]}
                    />
                  )}
                </TabsContent>

                <TabsContent value="users" className="outline-none">
                  <AdminUserManagement />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="pt-4 border-t border-border">
              {/* Additional Personal Content for non-admins if needed */}
              <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2">
                    Exclusive Deals for You
                  </h3>
                  <p className="text-white/60 text-sm max-w-md">
                    As a valued member, you have access to special rates on over
                    500,000 hotels worldwide.
                  </p>
                  <Button className="mt-6 bg-redmix hover:bg-red-600 text-white rounded-full px-8 font-black text-xs uppercase tracking-widest">
                    Explore Deals
                  </Button>
                </div>
                <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-redmix/20 blur-3xl rounded-full" />
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
