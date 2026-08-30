"use client";


import { Suspense, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { adminFetch } from "@/lib/api/admin-api";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import {
  Inbox,
  LayoutDashboard,
  TrendingUp,
  Gift,
  Plane,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Users,
  FileText,
  PauseCircle,
  Globe,
  PlaneLanding,
  PlaneTakeoff,
  MousePointerClick,
  Tag,
  Database,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { adminGetInquiryStats } from "@/lib/api/inquiries";
import { format } from "date-fns";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminDashboardStats } from "@/components/admin/AdminDashboardStats";
import { AdminPendingBookings } from "@/components/admin/AdminPendingBookings";
import { AdminAllBookings } from "@/components/admin/AdminAllBookings";
import { AdminWishlists } from "@/components/admin/AdminWishlists";
import { AdminPackageManagement } from "@/components/admin/AdminPackageManagement";
import { AdminCrmData } from "@/components/admin/AdminCrmData";
import { AdminSystemSettings } from "@/components/admin/AdminSystemSettings";
import { AdminSpanishJetcost } from "@/components/admin/AdminSpanishJetcost";
import { AdminCheapBid } from "@/components/admin/AdminCheapBid";
import { AdminHoldDestinations } from "@/components/admin/AdminHoldDestinations";
import { AdminHoldOrigins } from "@/components/admin/AdminHoldOrigins";
import { AdminClickDetails } from "@/components/admin/AdminClickDetails";
import { AdminWorldrixTable } from "@/components/admin/AdminWorldrixTable";
import { AdminFlightDetails } from "@/components/admin/AdminFlightDetails";
import { AdminCacheDebugger } from "@/components/admin/AdminCacheDebugger";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { useProfile } from "@/lib/hooks/use-profile";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
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

const ADMIN_CATEGORIES: Record<
  string,
  { id: string; label: string; icon: any }[]
> = {
  "Flights Data": [
    // { id: "spanish-jetcost", label: "Spanish Jetcost", icon: Plane },
    { id: "cheap-bid", label: "Cheap Bid", icon: Tag },
    { id: "flight-details", label: "Flight Details", icon: Plane },
    { id: "cache-debugger", label: "Cache Debugger", icon: Database },
    // { id: "click-details", label: "Click Details", icon: MousePointerClick },
  ],
  // "Core Management": [
  //   // { id: "bookings", label: "All Bookings", icon: LayoutDashboard }, deprecated
  //   // { id: "users", label: "Users", icon: Users },
  //   { id: "flight-details", label: "Flight Details", icon: Plane },
  // ],
  "Content & Deals": [
    { id: "packages", label: "Packages", icon: Gift },
    { id: "deals", label: "Flight Deals", icon: Plane },
    { id: "wishlists", label: "Wishlists", icon: Gift },
  ],
  // "API & Routes": [
  //   {
  //     id: "pause-api-destination",
  //     label: "Pause Api Destination",
  //     icon: PauseCircle,
  //   },
  //   {
  //     id: "origin-destinations",
  //     label: "Origin & Destinations",
  //     icon: Globe,
  //   },
  //   {
  //     id: "hold-destinations",
  //     label: "Display Hold Destinations",
  //     icon: PlaneLanding,
  //   },
  //   { id: "hold-origins", label: "Display Hold Origin", icon: PlaneTakeoff },
  //   { id: "click-details", label: "Click Details", icon: MousePointerClick },
  //   { id: "airline-fares", label: "Airline Fares", icon: Tag },
  // ],
  // "Worldrix CRM": [
  //   {
  //     id: "worldrix:agent-lead-details",
  //     label: "Agent Lead Details",
  //     icon: Database,
  //   },
  //   {
  //     id: "worldrix:agent-whatsapp-lead-details",
  //     label: "Agent WhatsApp Lead",
  //     icon: Database,
  //   },
  //   { id: "worldrix:click-detail", label: "Click Detail", icon: Database },
  //   {
  //     id: "worldrix:click-impression",
  //     label: "Click Impression",
  //     icon: Database,
  //   },
  //   { id: "worldrix:co-agent", label: "Co Agent", icon: Database },
  //   {
  //     id: "worldrix:co-agent-assign",
  //     label: "Co Agent Assign",
  //     icon: Database,
  //   },
  //   {
  //     id: "worldrix:co-agent-booking-detail",
  //     label: "Co Agent Booking Detail",
  //     icon: Database,
  //   },
  //   {
  //     id: "worldrix:co-agent-booking-details",
  //     label: "Co Agent Booking Details",
  //     icon: Database,
  //   },
  //   {
  //     id: "worldrix:hotel-booking-details",
  //     label: "Hotel Bookings",
  //     icon: Database,
  //   },
  //   {
  //     id: "worldrix:car-booking-details",
  //     label: "Car Bookings",
  //     icon: Database,
  //   },
  //   {
  //     id: "worldrix:co-booking-admin",
  //     label: "Co Booking Admin",
  //     icon: Database,
  //   },
  //   { id: "worldrix:co-marketing", label: "Co Marketing", icon: Database },
  //   { id: "worldrix:leads", label: "Leads", icon: Database },
  //   { id: "worldrix:whatsapp-leads", label: "WhatsApp Leads", icon: Database },
  // ],
  // "System Settings": [
  //   { id: "crm", label: "CRM Data", icon: FileText },
  //   { id: "system-settings", label: "System Settings", icon: Settings },
  // ],
};

const PENDING_PAGES: Record<string, string> = {
  "pause-api-destination": "Pause Api Destination",
  "origin-destinations": "Display Origin & Destinations",
  "airline-fares": "Airline Fares",
};

const WORLDRIX_PREFIX = "worldrix:";

function DashboardPageContent() {
  const { t } = useTranslation();
  const session = useAuthSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { open: openAuth } = useAuthModalStore();
  const [activeTab, setActiveTab] = useState("cheap-bid");
  const [isMobileMenu, setIsMobileMenu] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    "Pricing Rules",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let initialTab = tabParam;
    if (!initialTab && typeof window !== "undefined") {
      initialTab = localStorage.getItem("dashboard_active_tab");
    }
    if (initialTab) {
      setActiveTab(initialTab);
      for (const [category, items] of Object.entries(ADMIN_CATEGORIES)) {
        if (items.some((item) => item.id === initialTab)) {
          setExpandedCategory(category);
          break;
        }
      }
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard_active_tab", tabId);
    }
    router.push(`?tab=${tabId}`);
  };

  const isAdmin = useIsAdmin();

  const profileQuery = useQuery({
    queryKey: ["profile", "bff"],
    queryFn: () => apiFetch<UserProfile>("/user/profile"),
    enabled: Boolean(session.data) && session.isFetched,
  });

  const bookingsQuery = useQuery({
    queryKey: ["bookings", "bff"],
    queryFn: () => apiFetch<any[]>("/bookings/me"),
    enabled: Boolean(session.data) && !isAdmin,
  });

  const adminDashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => Promise.resolve(null),
    enabled: false,
  });

  const alertsQuery = useQuery({
    queryKey: ["price-alerts"],
    queryFn: () => Promise.resolve([]),
    enabled: false,
  });

  const inquiryStatsQuery = useQuery({
    queryKey: ["admin-inquiry-stats-dashboard"],
    queryFn: adminGetInquiryStats,
    enabled: Boolean(session.data) && isAdmin,
  });

  const profileMeQuery = useProfile(
    Boolean(session.data) && session.isFetched && !isAdmin,
  );

  const refetchAdminData = () => {
    adminDashboardQuery.refetch();
    inquiryStatsQuery.refetch();
  };

  useEffect(() => {
    if (session.isFetched && !session.isLoading) {
      if (!session.data) {
        openAuth("login");
      } else if (!isAdmin) {
        router.replace("/");
      }
    }
  }, [
    session.isFetched,
    session.isLoading,
    session.data,
    isAdmin,
    openAuth,
    router,
  ]);

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? t("Good morning")
      : now.getHours() < 18
        ? t("Good afternoon")
        : t("Good evening");
  const name =
    session.data?.firstName || profileQuery.data?.firstName || t("Traveler");

  const displayGreeting = mounted ? greeting : t("Hello");
  const displayName = mounted ? name : t("Traveler");

  if (!mounted) {
    return null;
  }

  if (session.isFetched && !session.data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border shadow-xl text-center">
            <h2 className="text-2xl font-bold mb-4">{t("Please Sign In")}</h2>
            <Button
              onClick={() => openAuth("login")}
              className="w-full bg-redmix hover:bg-red-600 text-white rounded-xl h-12 font-bold"
            >
              {t("Sign In")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        <div className="mx-auto w-full max-w-[1440px]">
          {isAdmin || session.isLoading ? (
            <div className="flex flex-col">
              <section
                className={cn(
                  "relative w-full overflow-hidden transition-all px-4 md:px-8",
                  !isMobileMenu ? "hidden lg:block" : "block",
                )}
              >
                <div className="space-y-8 mb-8 max-w-7xl mx-auto">
                  {/* Welcome Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-redmix font-bold tracking-widest text-xs mb-1">
                        {t("Administrator Portal")}
                      </p>
                      <h1 className="text-3xl font-bold tracking-tighter text-foreground leading-none">
                        {displayGreeting}, {displayName} 👋
                      </h1>
                    </div>
                  </div>

                  {/* <AdminDashboardStats
                    kpiData={adminDashboardQuery.data?.kpi}
                    isLoading={
                      session.isLoading || adminDashboardQuery.isLoading
                    }
                  /> */}

                  {/* Charts Section */}
                </div>
              </section>

              <section
                className={cn(
                  "mx-auto w-full max-w-[1440px] gap-5 px-3 md:px-5 pb-8 grid lg:grid-cols-[260px_1fr]",
                  !isMobileMenu ? "pt-4 lg:pt-0" : "pt-0",
                )}
              >
                <aside
                  className={cn(
                    "h-fit w-full lg:block",
                    isMobileMenu ? "block" : "hidden",
                  )}
                >
                  <div className="rounded-sm border border-border/50 bg-card shadow-sm overflow-hidden select-none">
                    <div className="px-4 py-4 pb-2 text-xs font-semibold tracking-wider text-foreground">
                      {t("Dashboard Categories")}
                    </div>
                    <div className="flex flex-col">
                      {Object.keys(ADMIN_CATEGORIES).map((categoryKey) => {
                        const isExpanded = expandedCategory === categoryKey;
                        const subItems = ADMIN_CATEGORIES[categoryKey];
                        return (
                          <div
                            key={categoryKey}
                            className="border-b border-border/50 last:border-0"
                          >
                            <button
                              onClick={() =>
                                setExpandedCategory(
                                  isExpanded ? null : categoryKey,
                                )
                              }
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors text-foreground",
                                isExpanded ? "bg-muted/30" : "",
                              )}
                            >
                              <div className="flex items-center gap-3 font-medium capitalize">
                                {t(categoryKey)}
                              </div>
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-muted/10"
                                >
                                  <div className="flex flex-col py-1 pl-11 pr-4">
                                    {subItems.map((item) => {
                                      const isActive = activeTab === item.id;
                                      const Icon = item.icon;
                                      return (
                                        <button
                                          key={item.id}
                                          onClick={() => {
                                            handleTabChange(item.id);
                                            setIsMobileMenu(false);
                                          }}
                                          className={cn(
                                            "flex items-center justify-between py-2.5 text-xs transition-colors border-b border-border/40 last:border-0",
                                            isActive
                                              ? "text-redmix dark:text-redmix/90 font-bold"
                                              : "text-foreground/70 hover:text-foreground",
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Icon className="h-3.5 w-3.5 opacity-70" />
                                            <span>{t(item.label)}</span>
                                          </div>
                                          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                <div
                  className={cn(
                    "w-full space-y-8 min-w-0 overflow-hidden",
                    !isMobileMenu ? "block" : "hidden lg:block",
                  )}
                >
                  {!isMobileMenu && (
                    <div className="mb-2 flex items-center lg:hidden">
                      <button
                        onClick={() => setIsMobileMenu(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />{" "}
                        {t("Back to Dashboard")}
                      </button>
                    </div>
                  )}

                  <div className="outline-none space-y-6 min-h-[50vh]">
                    {activeTab === "bookings" && (
                      <AdminAllBookings onRefetch={refetchAdminData} />
                    )}
                    {activeTab === "users" && <AdminUserManagement />}
                    {activeTab === "flight-details" && <AdminFlightDetails />}
                    {activeTab === "cache-debugger" && <AdminCacheDebugger />}
                    {activeTab === "wishlists" && (
                      <AdminWishlists onRefetch={refetchAdminData} />
                    )}
                    {activeTab === "packages" && (
                      <AdminPackageManagement type="package" />
                    )}
                    {activeTab === "deals" && (
                      <AdminPackageManagement type="flight_deal" />
                    )}
                    {activeTab === "crm" && <AdminCrmData />}
                    {activeTab === "system-settings" && <AdminSystemSettings />}
                    {activeTab === "spanish-jetcost" && <AdminSpanishJetcost />}
                    {activeTab === "cheap-bid" && <AdminCheapBid />}
                    {activeTab === "hold-destinations" && (
                      <AdminHoldDestinations />
                    )}
                    {activeTab === "hold-origins" && <AdminHoldOrigins />}
                    {activeTab === "click-details" && <AdminClickDetails />}
                    {activeTab.startsWith(WORLDRIX_PREFIX) && (
                      <AdminWorldrixTable
                        key={activeTab}
                        resource={activeTab.slice(WORLDRIX_PREFIX.length)}
                      />
                    )}
                    {PENDING_PAGES[activeTab] && (
                      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          {t(PENDING_PAGES[activeTab])}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t(
                            "This page is ready to be wired up — share the table schema and it will be enabled.",
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
              <UserDashboard
                name={name}
                greeting={greeting}
                loyaltyPoints={
                  profileMeQuery.data?.loyaltyAccount?.pointsBalance ?? 0
                }
                trips={bookingsQuery.data ?? []}
                alerts={alertsQuery.data ?? []}
                isLoading={bookingsQuery.isLoading}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Suspense-wrapped
export default function DashboardPage(props: any) {
  return (
    <Suspense fallback={null}>
      <DashboardPageContent {...props} />
    </Suspense>
  );
}
