"use client";


import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMyTrips, TripSummary, cancelTrip } from "@/lib/api/trips";
import { getMyInquiries, FlightInquiry } from "@/lib/api/inquiries";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { AppImage } from "@/components/ui/app-image";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PostTripReviewModal } from "@/components/reviews/PostTripReviewModal";
import { CancelBookingDialog } from "@/components/ui/cancel-booking-dialog";
import {
  Gift,
  Star,
  Sparkles,
  ArrowRight,
  Plane,
  Hotel,
  Car,
  Navigation,
  LayoutGrid,
  LayoutList,
  Copy,
  Check,
  Calendar,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { WishlistFlightCard } from "@/components/flights/WishlistFlightCard";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { FlightCard } from "@/components/flights/FlightCard";
import { PackageCard } from "@/components/packages/PackageCard";
import { HotelCard } from "@/components/hotels/HotelCard";
import { CarCard } from "@/components/cars/CarCard";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop";

export type UnifiedType =
  | "all"
  | "flight"
  | "hotel"
  | "package"
  | "car"
  | "transfer"
  | "inquiry";

export type UnifiedStatus = "all" | "in-progress" | "confirmed" | "cancelled";

export interface UnifiedItem {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate?: string;
  endDate?: string;
  source: "trip" | "inquiry";
  confirmationCode?: string;
  subtitle?: string;
  currency?: string;
  total?: number;
  hotelCity?: string | null;
  hotelCountry?: string | null;
  guestCount?: number | null;
  paymentStatus?: string | null;
  originalData: any;
}

function formatTripDate(value?: string) {
  if (!value) return "---";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHotelStayRange(startDate?: string, endDate?: string) {
  if (!startDate) return "---";
  if (!endDate || endDate === startDate) return formatTripDate(startDate);
  return `${formatTripDate(startDate)} – ${formatTripDate(endDate)}`;
}

function getHotelLocationLabel(item: UnifiedItem) {
  const city = item.hotelCity || item.originalData?.hotelCity;
  const country = item.hotelCountry || item.originalData?.hotelCountry;
  return [city, country].filter(Boolean).join(", ");
}

const typeIcons: Record<UnifiedType, any> = {
  all: Sparkles,
  flight: Plane,
  hotel: Hotel,
  package: Gift,
  car: Car,
  transfer: Navigation,
  inquiry: Sparkles,
};

function getStatusLabel(status: string, source: "trip" | "inquiry") {
  if (source === "trip") {
    if (status === "completed") return "Confirmed";
    if (status === "upcoming" || status === "pending") return "In Progress";
    if (status === "confirmed") return "Confirmed";
    if (status === "cancelled") return "Cancelled";
  } else {
    if (status === "pending" || status === "reviewed" || status === "contacted")
      return "In Progress";
    if (status === "closed") return "Cancelled";
  }
  return status;
}

function getStatusBadgeColors(mappedStatus: string) {
  if (mappedStatus === "Confirmed") {
    return "bg-green-500/10 text-green-600 border-green-500/20";
  }
  if (mappedStatus === "In Progress") {
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
  return "bg-slate-500/10 text-slate-500 border-slate-500/20";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 p-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground transition cursor-pointer select-none"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function UnifiedCard({
  item,
  setIsReviewModalOpen,
  onCancel,
}: {
  item: UnifiedItem;
  setIsReviewModalOpen: (open: boolean) => void;
  onCancel: (bookingId: string, source: "trip" | "inquiry") => void;
}) {
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currentCurrency = SUPPORTED_CURRENCIES[baseCurrency];
  const TypeIcon = typeIcons[item.type as UnifiedType] || Sparkles;

  const amountStr = useMemo(() => {
    const val =
      typeof item.total === "number"
        ? item.total
        : parseFloat(item.total as any) || 0;
    if (isNaN(val)) return `${currentCurrency.symbol}0`;
    const converted = getConvertedAmount(
      val,
      (item.currency || "USD") as any,
      baseCurrency,
    );
    return `${currentCurrency.symbol} ${Math.round(converted).toLocaleString()}`;
  }, [
    item.total,
    item.currency,
    baseCurrency,
    getConvertedAmount,
    currentCurrency,
  ]);

  const titleParts = (item.title || "").split("→").map((s) => s.trim());
  const hasPath = titleParts.length === 2;

  const mappedStatus = getStatusLabel(item.status, item.source);
  const statusColors = getStatusBadgeColors(mappedStatus);
  const isHotel = item.type === "hotel";
  const hotelLocation = isHotel ? getHotelLocationLabel(item) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-border/50 bg-card p-4 xs:p-6 shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-redmix/20">
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-redmix/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />
        <div className="absolute -left-16 -bottom-16 h-32 w-32 rounded-full bg-redmix/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-redmix/10 text-redmix transition-all duration-300 group-hover:bg-redmix group-hover:text-white group-hover:rotate-6 group-hover:scale-110 shrink-0">
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
                      {item.title}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                  REF: {item.confirmationCode}
                  <CopyButton text={item.confirmationCode || ""} />
                </div>
              </div>
            </div>
            <span
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider select-none",
                statusColors,
              )}
            >
              {mappedStatus}
            </span>
          </div>

          {item.subtitle && (
            <p className="text-sm font-semibold text-muted-foreground line-clamp-2 leading-relaxed">
              {item.subtitle}
            </p>
          )}

          {isHotel && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
              {hotelLocation ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    City
                  </p>
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Hotel className="h-3.5 w-3.5 text-redmix" />
                    {hotelLocation}
                  </p>
                </div>
              ) : null}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Stay
                </p>
                <p className="text-sm font-bold text-foreground">
                  {formatHotelStayRange(item.startDate, item.endDate)}
                </p>
              </div>
              {(item.guestCount ?? 0) > 0 ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Guests
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {item.guestCount} guest{item.guestCount === 1 ? "" : "s"}
                  </p>
                </div>
              ) : null}
              {item.paymentStatus ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Payment
                  </p>
                  <p className="text-sm font-bold capitalize text-foreground">
                    {item.paymentStatus}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-6 bg-muted/30 rounded-xl md:rounded-2xl p-4 transition-colors group-hover:bg-muted/50">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {isHotel ? "Check-in / Check-out" : "Date"}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="h-3.5 w-3.5 text-redmix" />
                <span>
                  {isHotel
                    ? formatHotelStayRange(item.startDate, item.endDate)
                    : formatTripDate(item.startDate)}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Cost
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-redmix animate-pulse" />
                <span>{amountStr}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between border-t border-border/40 pt-4 xs:pt-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 items-center gap-2 rounded-full px-4 text-[10px] font-bold uppercase tracking-wider transition-all bg-muted text-muted-foreground">
                {item.type}
              </div>
            </div>
            {/* Temporarily hidden action buttons */}
            <div className="flex items-center gap-2 hidden">
              {item.source === "trip" && (
                <Link
                  href={`/my-trips/${item.id}` as any}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-redmix hover:bg-redmix/90 rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              {mappedStatus !== "Cancelled" && (
                <CancelBookingDialog
                  onConfirm={() => onCancel(item.id, item.source)}
                  title={`Are you sure you want to cancel this ${item.source === "inquiry" ? "inquiry" : "booking"}?`}
                  description="This action cannot be undone and your booking status will be changed to cancelled."
                  trigger={
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                      Cancel
                    </button>
                  }
                />
              )}
              {item.source === "inquiry" && item.originalData.adminNotes && (
                <span className="text-redmix font-bold text-[10px] uppercase tracking-wider animate-pulse select-none">
                  Note from Agent
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyTripsPage() {
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currentCurrency = SUPPORTED_CURRENCIES[baseCurrency];

  const [tab, setTab] = useState<UnifiedType>("all");
  const [isMobileMenu, setIsMobileMenu] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<UnifiedType | null>(
    null,
  );
  const [status, setStatus] = useState<UnifiedStatus>("all");
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [inquiries, setInquiries] = useState<FlightInquiry[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [pageLoading, setPageLoading] = useState(true);
  const wishlistItems = useWishlistStore((state) => state.items);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: session, isLoading: sessionLoading } = useAuthSession();
  const router = useRouter();

  const initializeWishlist = useWishlistStore((state) => state.initialize);

  useEffect(() => {
    if (!sessionLoading) {
      initializeWishlist(session?.id);
    }
  }, [session, sessionLoading, initializeWishlist]);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("my-trips-view-mode");
      if (stored === "card" || stored === "list") {
        setViewMode(stored);
      }
    }
  }, []);

  const toggleView = (mode: "list" | "card") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("my-trips-view-mode", mode);
    }
  };

  useEffect(() => {
    if (session) {
      setPageLoading(true);
      getMyTrips(undefined, undefined, 10, currentPage)
        .then((tripsData) => {
          setTrips(tripsData.filter((t) => (t.type as string) !== "inquiry"));
          setInquiries(
            tripsData
              .filter((t) => (t.type as string) === "inquiry")
              .map(
                (t) =>
                  ({
                    id: t.id,
                    origin: t.title.split("→")[0]?.trim() || "",
                    destination: t.title.split("→")[1]?.trim() || "",
                    status: t.status.toUpperCase(),
                    departDate: t.startDate,
                    createdAt: t.createdAt,
                    cabinClass: t.subtitle.split("•")[1]?.trim() || "Economy",
                    tripType: "flight",
                    total: t.total,
                    currency: t.currency,
                    originalData: (t as any).originalData || t,
                  }) as any,
              ),
          );
          setHasMore(tripsData.length === 10);
          setPageLoading(false);
        })
        .catch(() => {
          setTrips([]);
          setInquiries([]);
          setHasMore(false);
          setPageLoading(false);
        });
    }
  }, [session, currentPage]);

  const counts = useMemo(() => {
    const base: Record<UnifiedType, number> = {
      all: trips.length + inquiries.length,
      flight:
        trips.filter((t) => t.type === "flight").length + inquiries.length,
      hotel: trips.filter((t) => t.type === "hotel").length,
      package: trips.filter((t) => t.type === "package").length,
      car: trips.filter((t) => t.type === "car").length,
      transfer: trips.filter((t) => t.type === "transfer").length,
      inquiry: inquiries.length,
    };
    return base;
  }, [trips, inquiries]);

  const filteredItems = useMemo(() => {
    const allUnified: UnifiedItem[] = [
      ...trips.map((trip) => ({
        id: trip.id,
        title: trip.title || "Untitled Trip",
        type: trip.type,
        status: (trip.status || "upcoming").toLowerCase(),
        startDate: trip.startDate,
        endDate: trip.endDate,
        source: "trip" as const,
        confirmationCode: trip.confirmationCode,
        subtitle: trip.subtitle,
        currency: trip.currency,
        total: trip.total,
        hotelCity: trip.hotelCity,
        hotelCountry: trip.hotelCountry,
        guestCount: trip.guestCount,
        paymentStatus: trip.paymentStatus,
        originalData: trip,
      })),
      ...inquiries.map((inq) => ({
        id: inq.id,
        title: `${inq.origin || "---"} → ${inq.destination || "---"}`,
        type: "flight",
        status: (inq.status || "PENDING").toLowerCase(),
        startDate: inq.departDate || inq.createdAt,
        endDate: inq.departDate || inq.createdAt,
        source: "inquiry" as const,
        confirmationCode: `INQ-${inq.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
        subtitle: `${inq.departDate || "No Date"} • ${inq.cabinClass || "Economy"}`,
        currency: (inq as any).currency || "USD",
        total: (inq as any).total || 0,
        originalData: inq,
      })),
    ];

    return allUnified.filter((item) => {
      let typeMatch = false;
      if (tab === "all") {
        typeMatch = true;
      } else if (tab === "inquiry") {
        typeMatch = item.source === "inquiry";
      } else {
        typeMatch = item.type === tab;
      }

      let statusMatch = true;
      if (status === "in-progress") {
        if (item.source === "trip") {
          statusMatch = ["pending", "in-progress", "upcoming"].includes(
            item.status,
          );
        } else {
          statusMatch = ["pending", "reviewed", "contacted"].includes(
            item.status,
          );
        }
      } else if (status === "confirmed") {
        if (item.source === "trip") {
          statusMatch = ["confirmed", "completed"].includes(item.status);
        } else {
          statusMatch = false;
        }
      } else if (status === "cancelled") {
        if (item.source === "trip") {
          statusMatch = ["cancelled"].includes(item.status);
        } else {
          statusMatch = ["closed"].includes(item.status);
        }
      }

      return typeMatch && statusMatch;
    });
  }, [trips, inquiries, tab, status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [tab, status]);

  const totalPages = hasMore ? currentPage + 1 : currentPage;

  const paginatedItems = filteredItems;

  const stats = useMemo(() => {
    const confirmed = trips.filter(
      (t) =>
        t.status === "confirmed" ||
        t.status === "upcoming" ||
        t.status === "completed",
    ).length;
    const inquired = inquiries.length;
    const totalBookings = trips.length;
    return { confirmed, inquired, totalBookings };
  }, [trips, inquiries]);

  const handleCancel = async (
    bookingId: string,
    source: "trip" | "inquiry" = "trip",
  ) => {
    try {
      await cancelTrip(bookingId, "Cancelled by user");
      if (source === "trip") {
        setTrips((prev) =>
          prev.map((t) =>
            t.id === bookingId ? { ...t, status: "cancelled" } : t,
          ),
        );
      } else {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === bookingId ? { ...inq, status: "CLOSED" } : inq,
          ),
        );
      }
      alert("Cancelled successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to cancel");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between pb-24 md:pb-0">
      <div>
        <Header />
        <section
          className={cn(
            "relative w-full overflow-hidden transition-all",
            !isMobileMenu
              ? "hidden lg:block lg:min-h-[100dvh]"
              : "min-h-[35vh] md:min-h-[100dvh]",
          )}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <AppImage
              src={HERO_IMAGE}
              alt="Travel adventures"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/60 to-black/75" />

          <div className="relative z-10 mx-auto mt-20 md:mt-auto flex flex-col h-full items-center justify-center p-5 min-h-[35vh] md:min-h-[100dvh] text-white pointer-events-none">
            <motion.span
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="md:mb-4 mt-4 relative overflow-hidden rounded-full p-[2px] backdrop-blur block cursor-pointer group pointer-events-auto select-none"
            >
              {/* Animated Gradient Border Layer */}
              <motion.span
                className="absolute inset-0 rounded-full bg-gradient-to-r from-redmix via-yellow to-[#0d2353]"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ originX: "50%", originY: "50%" }}
              />

              {/* Pulsing Outer Blur Glow */}
              <motion.span
                className="absolute -inset-1 rounded-full bg-gradient-to-r from-redmix via-yellow to-[#0d2353] blur-sm opacity-50 group-hover:opacity-85 transition-opacity"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ originX: "50%", originY: "50%" }}
              />

              {/* Inner Content Container */}
              <div className="relative z-10 rounded-full bg-[#0e0e0e]/95 px-4 py-1.5 text-[11px] md:text-xs font-bold text-white/95 flex items-center gap-2 transition-colors group-hover:bg-[#0e0e0e]/85 uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-redmix opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-redmix"></span>
                </span>
                <span>Your Travel Dashboard</span>
              </div>
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              className="text-3xl md:text-5xl text-center font-black tracking-wider text-white uppercase select-none mt-6 md:mt-0"
            >
              My{" "}
              <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent">
                Trips & Inquiries
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
              className="mt-3 max-w-xl text-center text-xs md:text-sm font-semibold text-white/80 select-none"
            >
              Track and manage all your verified travel bookings and tailored
              flight inquiries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
              className="mt-6 grid w-full max-w-xl grid-cols-3 gap-2 rounded-md border border-white/20 bg-[#0e0e0e] p-3  select-none"
            >
              <div className="text-center">
                <div className="text-sm md:text-xl font-semibold">
                  {stats.confirmed}
                </div>
                <p className="text-xs font-semibold text-white ">Confirmed</p>
              </div>
              <div className="text-center border-l border-white/30">
                <div className="text-sm md:text-xl font-semibold">
                  {stats.inquired}
                </div>
                <p className="text-xs font-semibold text-white ">Inquired</p>
              </div>
              <div className="text-center border-l border-white/30">
                <div className="text-sm md:text-xl font-semibold">
                  {stats.totalBookings}
                </div>
                <p className="text-xs font-semibold text-white ">Total</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          className={cn(
            "mx-auto grid max-w-[1440px] gap-5 px-3 md:px-5 pb-8 lg:grid-cols-[260px_1fr]",
            !isMobileMenu ? "pt-24 lg:pt-8" : "pt-8",
          )}
        >
          <aside
            className={cn(
              "h-fit w-full lg:block",
              isMobileMenu ? "block" : "hidden",
            )}
          >
            <div className="rounded-sm border border-border/50 bg-card shadow-sm overflow-hidden select-none">
              <div className="px-4 py-4 pb-2 text-xs font-semibold  tracking-wider text-foreground">
                Trip Categories
              </div>
              <div className="flex flex-col">
                {(Object.keys(counts) as UnifiedType[]).map((key) => {
                  const isActive = tab === key;
                  const isExpanded = expandedCategory === key;
                  const Icon = typeIcons[key] || Sparkles;
                  return (
                    <div
                      key={key}
                      className="border-b border-border/50 last:border-0"
                    >
                      <button
                        onClick={() =>
                          setExpandedCategory(isExpanded ? null : key)
                        }
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3.5 text-sm hover:bg-muted/50 transition-colors text-foreground",
                          isExpanded ? "bg-muted/30" : "",
                        )}
                      >
                        <div className="flex items-center gap-3 font-medium capitalize">
                          <Icon className="h-4 w-4" /> {key}
                        </div>
                        <div className="flex items-center gap-2">
                          {counts[key] > 0 && (
                            <span
                              className={
                                "text-xs font-semibold px-2 py-0.5 rounded-full text-foreground"
                              }
                            >
                              {counts[key]}
                            </span>
                          )}
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
                              {(
                                [
                                  "all",
                                  "in-progress",
                                  "confirmed",
                                  "cancelled",
                                ] as UnifiedStatus[]
                              ).map((subStatus) => {
                                const isSubActive =
                                  isActive && status === subStatus;
                                return (
                                  <button
                                    key={subStatus}
                                    onClick={() => {
                                      setTab(key);
                                      setStatus(subStatus);
                                      setIsMobileMenu(false);
                                    }}
                                    className={cn(
                                      "flex items-center justify-between py-2.5 text-sm transition-colors border-b border-border/40 last:border-0",
                                      isSubActive
                                        ? "text-redmix font-bold"
                                        : "text-foreground/90 hover:text-foreground",
                                    )}
                                  >
                                    <span className="capitalize">
                                      {subStatus.replace("-", " ")}
                                    </span>
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
              "w-full space-y-8",
              !isMobileMenu ? "block" : "hidden lg:block",
            )}
          >
            {!isMobileMenu && (
              <div className="mb-2 flex items-center lg:hidden">
                <button
                  onClick={() => setIsMobileMenu(true)}
                  className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to Menu
                </button>
              </div>
            )}

            {/* Review Reminder Perk Banner */}
            {(status === "all" || status === "confirmed") &&
              paginatedItems.some(
                (i) => i.source === "trip" && i.status === "completed",
              ) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                >
                  <div className="relative group bg-slate-950 rounded-2xl p-6 md:p-8 text-white shadow-2xl border border-white/10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/20 blur-[80px] -mr-20 -mt-20 opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[60px] -ml-20 -mb-20 opacity-30" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Star className="w-6 h-6 text-brand-red fill-brand-red" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-brand-red/20 text-brand-red text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-brand-red/20">
                              Loyalty Perk
                            </span>
                          </div>
                          <h3 className="text-xl font-bold tracking-tight select-none">
                            Completed Trip Pending Review
                          </h3>
                          <p className="text-xs text-white/70 font-medium max-w-sm select-none leading-relaxed">
                            Share your recent experience to earn{" "}
                            <span className="text-white font-bold underline decoration-brand-red">
                              250 EzeePoints
                            </span>{" "}
                            instantly.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-red text-white px-5 py-3 rounded-xl font-bold group/btn hover:shadow-2xl hover:shadow-brand-red/40 transition-all active:scale-95 cursor-pointer text-xs"
                      >
                        <Gift className="w-4 h-4 group-hover/btn:animate-bounce" />
                        Review & Earn
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs md:text-sm font-bold text-foreground uppercase tracking-wider select-none">
                  Total Items ({filteredItems.length})
                </h3>
                <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/40 select-none shrink-0">
                  <button
                    onClick={() => toggleView("list")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-900 text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                    List
                  </button>
                  <button
                    onClick={() => toggleView("card")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                      viewMode === "card"
                        ? "bg-white dark:bg-slate-900 text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Card
                  </button>
                </div>
              </div>

              {pageLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 bg-muted animate-pulse rounded-2xl border border-border/60"
                    />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card shadow-sm select-none">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                    <Plane className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <p className="text-base font-bold text-foreground">
                    No items found
                  </p>
                  <p className="mb-4 text-xs text-muted-foreground font-medium">
                    Try modifying your filter options above.
                  </p>
                  <Link
                    href="/flights"
                    className="inline-block rounded-xl bg-redmix px-5 py-2.5 text-xs font-bold uppercase text-white transition hover:brightness-110 shadow-md shadow-redmix/20 hover:scale-105 active:scale-95"
                  >
                    Search flights
                  </Link>
                </div>
              ) : viewMode === "list" ? (
                <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                  <table className="w-full border-collapse text-left text-xs md:text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-bold select-none">
                        <th className="p-4 text-xs font-black uppercase tracking-wider">
                          ID / Status
                        </th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider">
                          Type
                        </th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider">
                          Route / Details
                        </th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="p-4 text-xs font-black uppercase tracking-wider text-right hidden">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <AnimatePresence>
                        {paginatedItems.map((item) => {
                          const titleParts = (item.title || "")
                            .split("→")
                            .map((s) => s.trim());
                          const hasPath = titleParts.length === 2;
                          const mappedStatus = getStatusLabel(
                            item.status,
                            item.source,
                          );
                          const badgeColors =
                            getStatusBadgeColors(mappedStatus);

                          const val =
                            typeof item.total === "number"
                              ? item.total
                              : parseFloat(item.total as any) || 0;
                          const converted = getConvertedAmount(
                            val,
                            (item.currency || "USD") as any,
                            baseCurrency,
                          );
                          const amountStr = isNaN(val)
                            ? `${currentCurrency.symbol}0`
                            : `${currentCurrency.symbol} ${Math.round(converted).toLocaleString()}`;
                          const isHotelRow = item.type === "hotel";
                          const hotelLocationRow = isHotelRow
                            ? getHotelLocationLabel(item)
                            : "";

                          return (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="p-4 font-mono text-xs font-bold text-foreground">
                                <div className="flex flex-col gap-1">
                                  <span>
                                    {item.id.toUpperCase().slice(0, 8)}
                                  </span>
                                  <span
                                    className={cn(
                                      "inline-flex w-fit px-2 py-0.5 text-[10px] font-bold rounded-full border tracking-wide uppercase select-none",
                                      badgeColors,
                                    )}
                                  >
                                    {mappedStatus}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 font-bold capitalize">
                                {item.type}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col gap-0.5">
                                  {hasPath ? (
                                    <span className="font-bold text-foreground flex items-center gap-1.5">
                                      {titleParts[0]}{" "}
                                      <Plane className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                                      {titleParts[1]}
                                    </span>
                                  ) : (
                                    <span className="font-bold text-foreground line-clamp-2">
                                      {item.title || "Untitled Trip"}
                                    </span>
                                  )}
                                  {isHotelRow && hotelLocationRow ? (
                                    <span className="text-xs font-semibold text-redmix/90 flex items-center gap-1">
                                      <Hotel className="h-3 w-3" />
                                      {hotelLocationRow}
                                    </span>
                                  ) : null}
                                  {item.subtitle && isHotelRow ? (
                                    <span className="text-xs font-medium text-muted-foreground line-clamp-2">
                                      {item.subtitle}
                                    </span>
                                  ) : null}
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {isHotelRow
                                      ? formatHotelStayRange(
                                          item.startDate,
                                          item.endDate,
                                        )
                                      : formatTripDate(item.startDate)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-foreground">
                                {amountStr}
                              </td>
                              <td className="p-4 font-mono text-xs font-bold text-muted-foreground uppercase select-all">
                                <div className="flex items-center gap-1.5">
                                  <span>{item.confirmationCode || "---"}</span>
                                  <CopyButton
                                    text={item.confirmationCode || ""}
                                  />
                                </div>
                              </td>
                              <td className="p-4 text-right hidden">
                                <div className="flex items-center justify-end gap-2">
                                  {item.source === "trip" && (
                                    <Link
                                      href={`/my-trips/${item.id}` as any}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-redmix hover:bg-redmix/90 rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                                    >
                                      View Details{" "}
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                  )}
                                  {mappedStatus !== "Cancelled" && (
                                    <CancelBookingDialog
                                      onConfirm={() =>
                                        handleCancel(item.id, item.source)
                                      }
                                      title={`Are you sure you want to cancel this ${item.source === "inquiry" ? "inquiry" : "booking"}?`}
                                      description="This action cannot be undone and your booking status will be changed to cancelled."
                                      trigger={
                                        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                                          Cancel
                                        </button>
                                      }
                                    />
                                  )}
                                  {item.source === "inquiry" &&
                                    item.originalData.adminNotes && (
                                      <span className="text-redmix font-bold text-[10px] uppercase tracking-wider animate-pulse select-none">
                                        Note from Agent
                                      </span>
                                    )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  <AnimatePresence>
                    {paginatedItems.map((item) => (
                      <UnifiedCard
                        key={item.id}
                        item={item}
                        setIsReviewModalOpen={setIsReviewModalOpen}
                        onCancel={handleCancel}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 2 && (
                <div className="flex items-center justify-between border-t border-border/40 bg-card px-4 py-4 sm:px-6 rounded-2xl shadow-sm border mt-6 select-none">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-xl border border-border/60 bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-50 select-none cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-xl border border-border/60 bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted disabled:opacity-50 select-none cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        Showing{" "}
                        <span className="font-bold text-foreground">
                          {Math.min(
                            filteredItems.length,
                            (currentPage - 1) * itemsPerPage + 1,
                          )}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-foreground">
                          {Math.min(
                            filteredItems.length,
                            currentPage * itemsPerPage,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-foreground">
                          {filteredItems.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-muted/20 p-1 border border-border/40 gap-1 select-none">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-lg px-2.5 py-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
                        >
                          <span className="sr-only">Previous</span>
                          <ArrowRight className="h-4 w-4 rotate-180" />
                        </button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              "relative inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                              currentPage === page
                                ? "bg-redmix text-white shadow-sm"
                                : "text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-lg px-2.5 py-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
                        >
                          <span className="sr-only">Next</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Wishlist Section */}
        <section
          className={cn(
            "mx-auto w-full max-w-[1440px] px-3 md:px-5 pb-16",
            !isMobileMenu ? "hidden lg:block" : "block",
          )}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-3xl bg-redmix/10 flex items-center justify-center text-redmix">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground ">
                Saved Favorites
              </h2>
              <p className="text-xs font-semibold text-foreground/90  tracking-wider">
                Items you've hearted for later
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {wishlistItems.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border/80 p-5 text-center bg-card shadow-sm">
                <Heart className="h-10 w-10 text-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground/80">
                  Your wishlist is empty.
                </p>
                {/* <button className="mt-4 bg-redmix text-white rounded-lg px-4 py-2 text-sm font-semibold">
                  Start Searching
                </button> */}
              </div>
            ) : (
              <div className="flex items-stretch overflow-x-auto gap-6 pb-8 no-scrollbar snap-x snap-mandatory -mx-5 px-5">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 w-[400px] max-w-[85vw] snap-start h-full"
                  >
                    {item.entityType === "flights" ? (
                      <WishlistFlightCard flight={item.data} />
                    ) : item.entityType === "packages" ||
                      item.entityType === "package" ? (
                      <PackageCard item={item.data} />
                    ) : item.entityType === "hotels" ||
                      item.entityType === "hotel" ? (
                      <HotelCard
                        hotel={item.data}
                        checkInDate={new Date().toISOString()}
                        checkOutDate={new Date(
                          Date.now() + 86400000,
                        ).toISOString()}
                      />
                    ) : item.entityType === "cars" ||
                      item.entityType === "car" ? (
                      <CarCard car={item.data} />
                    ) : (
                      <div className="p-4 border border-border rounded-xl bg-card h-full flex flex-col">
                        <p className="font-bold mb-2">
                          {(item.entityType || "").toUpperCase()}
                        </p>
                        <pre className="text-xs overflow-auto flex-1 max-h-[300px]">
                          {JSON.stringify(item.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <PostTripReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
