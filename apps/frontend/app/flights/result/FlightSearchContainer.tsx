"use client";

import React, {
  useMemo,
  useState,
  useTransition,
  useEffect,
  useRef,
  useDeferredValue,
} from "react";
import { Drawer } from "vaul";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import {
  SlidersHorizontal,
  Sparkles,
  Info,
  RefreshCw,
  ChevronDown,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlightListItem } from "@/lib/types/flight-api";
import type { FlightSearchAirlineSummary } from "@/lib/api/flights";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { filterFlights } from "@/lib/utils/filter-flights";
import { FlightFlexibleDateMatrix } from "@/components/flights/FlightFlexibleDateMatrix";
import { FlightFilterSidebar } from "@/components/flights/FlightFilterSidebar";
import { AirlineLogo } from "@/components/flights/AirlineLogo";
import {
  FlightCard,
  FlightLeg,
  calculateLegDuration,
} from "@/components/flights/FlightCard";
import { FlightBidDealCard } from "@/components/flights/FlightBidDealCard";
import { FlightAiSuggestionsPanel } from "./FlightAiSuggestionsPanel";
import { beginDestinationInsightsSearch } from "@/lib/api/destination-insights";
import { normalizeDestinationCode } from "@/lib/store/destination-insights-store";
import {
  FlightResultSkeleton,
  FilterSidebarSkeleton,
  AiSidebarSkeleton,
} from "@/components/flights/FlightCardSkeleton";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { FlightAirlineMatrix } from "@/components/flights/FlightAirlineMatrix";
import { apiFetch } from "@/lib/api/client";
import { getMyInquiries, FlightInquiry } from "@/lib/api/inquiries";
import { fetchClientGeo } from "@/lib/currency/client-geo";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { FlightSearchCheapBidModal } from "@/components/admin/AdminCheapBid";
import dynamic from "next/dynamic";
import { useCacheIndicatorStore } from "@/lib/store/cache-indicator-store";
import { formatCabinClassLabel } from "@/lib/utils/cabin-class";

function getFriendlyError(err: string | undefined): { title: string; description: string } {
  if (!err) {
    return {
      title: t("No flights found"),
      description: t("Try modifying your filters or search dates.")
    };
  }

  let message = err;
  try {
    if (err.trim().startsWith("{") && err.trim().endsWith("}")) {
      const parsed = JSON.parse(err);
      if (parsed.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(", ") : String(parsed.message);
      } else if (parsed.error) {
        message = String(parsed.error);
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  const errStr = message.toLowerCase();

  // DNS lookup failure
  if (errStr.includes("enotfound") || errStr.includes("getaddrinfo")) {
    return {
      title: t("Connection Error"),
      description: t("Unable to connect to the flight search service. Please check your internet connection or try again later.")
    };
  }

  // Timeout
  if (errStr.includes("etimeout") || errStr.includes("timeout") || errStr.includes("timed out")) {
    return {
      title: t("Request Timeout"),
      description: t("The search request took too long. Please try reloading the search.")
    };
  }

  // Connection refused / server down
  if (errStr.includes("econnrefused") || errStr.includes("connection refused")) {
    return {
      title: t("Service Unavailable"),
      description: t("The flight search service is temporarily unavailable. Please try again later.")
    };
  }

  // Network/fetch failure
  if (errStr.includes("fetch failed") || errStr.includes("network error") || errStr.includes("socket hang up")) {
    return {
      title: t("Network Error"),
      description: t("We are having trouble communicating with the flight booking service. Please check your network connection and try again.")
    };
  }

  // HTTP 4xx validation errors or 5xx server errors
  if (errStr.includes("http 4") || errStr.includes("bad request") || errStr.includes("invalid")) {
    return {
      title: t("Invalid Search Request"),
      description: t("The search parameters provided are invalid. Please check your search options and try again.")
    };
  }

  if (errStr.includes("http 5") || errStr.includes("internal server error")) {
    return {
      title: t("Search Error"),
      description: t("We encountered an internal error processing your search. Please try a different date or route.")
    };
  }

  // Fallback check if it looks like a system error
  const isSystemError = /^[A-Z0-9_]+$/.test(message) || message.includes(":") || message.includes(".") || (message.includes(" ") && (message.includes("http") || message.includes("error") || message.includes("exception")));

  if (isSystemError) {
    return {
      title: t("Search Error"),
      description: t("Something went wrong while searching for flights. Please try again.")
    };
  }

  return {
    title: t(message),
    description: t("Try modifying your filters or search dates.")
  };
}

const cabinMap: Record<string, string> = {
  FIRST: "First",
  BUSINESS: "Business",
  PREMIUM_ECONOMY: "PremiumEconomy",
  ECONOMY: "Economy",
};
type SortMode = "best" | "cheapest" | "fastest" | "duration" | "bid";

const SORT_OPTIONS: SortMode[] = [
  "best",
  "cheapest",
  "fastest",
  "duration",
  "bid",
];

interface Props {
  initialFlights: FlightListItem[];
  airlineSummary?: FlightSearchAirlineSummary[];
  isLoading?: boolean;
  totalCount: number;
  currentPage: number;
  multiCitySegments?: {
    segment: { origin: string; destination: string; date: string };
    flights: FlightListItem[];
  }[];
  error?: string;
  prefClass?: string;
  /** True when the search result was returned from Redis cache */
  fromCache?: boolean;
  /** ISO timestamp of when the result was originally fetched and cached */
  cachedAt?: string;
  suggestedCabin?: string;
}

export function FlightSearchContainer({
  initialFlights,
  airlineSummary = [],
  isLoading,
  totalCount,
  currentPage,
  multiCitySegments,
  error,
  prefClass = "Economy",
  fromCache,
  cachedAt,
  suggestedCabin,
}: Props) {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters } = useFlightFilterStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const loggedBookingBuddyClickRef = useRef<string | null>(null);

  useEffect(() => {
    const rawUtmSource = searchParams.get("utm_source") || "";
    const cleanSource = rawUtmSource.trim().toLowerCase();

    if (cleanSource === "bookingbuddy" || cleanSource === "booking_buddy") {
      const clickId = searchParams.get("click_id") || searchParams.get("click-id") || "";
      const id =
        clickId ||
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2));

      if (loggedBookingBuddyClickRef.current === id) {
        return;
      }
      loggedBookingBuddyClickRef.current = id;

      const formatLogDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return `${dateStr}T00:00:00`;
        }
        return dateStr;
      };

      const logData = {
        Org: searchParams.get("org") || searchParams.get("Org") || null,
        Des: searchParams.get("des") || searchParams.get("Des") || null,
        DDate: formatLogDate(
          searchParams.get("dDate") || searchParams.get("DDate"),
        ),
        RDate: formatLogDate(
          searchParams.get("rDate") || searchParams.get("RDate"),
        ),
        Adt: parseInt(
          searchParams.get("adt") || searchParams.get("adults") || "1",
          10,
        ),
        Chld: parseInt(
          searchParams.get("chld") || searchParams.get("children") || "0",
          10,
        ),
        Inf: parseInt(
          searchParams.get("inf") || searchParams.get("infants") || "0",
          10,
        ),
        Ref: null,
        TCode: null,
        Cabin:
          searchParams.get("cabin") || searchParams.get("Cabin") || "Economy",
        DirectFlightsOnly: false,
        utm_source: "BookingBuddy",
        utm_medium: "cpc",
        utm_campaign: searchParams.get("utm_campaign") || null,
        email: null,
        phoneNo: null,
      };

      fetchClientGeo()
        .then((geo: any) => {
          const clientIp = geo?.ip || null;
          apiFetch("/flights/click-detail", {
            method: "POST",
            body: JSON.stringify({
              id,
              log: logData,
              sitesource: "USA-Ezeeflights",
              ip: clientIp,
            }),
          }).catch((err: any) => {
            console.error("Error logging BookingBuddy click detail:", err);
          });
        })
        .catch((err: any) => {
          console.warn(
            "[FlightSearchContainer] Geolocation IP lookup failed, falling back to connection IP:",
            err,
          );
          apiFetch("/flights/click-detail", {
            method: "POST",
            body: JSON.stringify({
              id,
              log: logData,
              sitesource: "USA-Ezeeflights",
            }),
          }).catch((err2: any) => {
            console.error("Error logging BookingBuddy click detail fallback:", err2);
          });
        });
    }
  }, [searchParams]);

  // Load initial sortMode from URL search parameters (defaulting to "cheapest")
  const urlSort = searchParams.get("sort") as SortMode;
  const initialSortMode: SortMode = [
    "best",
    "cheapest",
    "fastest",
    "duration",
    "bid",
  ].includes(urlSort)
    ? urlSort
    : "cheapest";

  const [sortMode, setSortModeState] = useState<SortMode>(initialSortMode);

  // Sync sortMode update to URL search parameters to preserve state on back navigation
  const setSortMode = (mode: SortMode) => {
    startSortTransition(() => {
      setSortModeState(mode);
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", mode);
      window.history.replaceState(null, "", `?${params.toString()}`);
    });
  };

  const handleSearchSuggestedCabin = (newCabin: string) => {
    startTransition(() => {
      startLoading(
        t("Searching flights in {{cabin}}...", { cabin: t(formatCabinClassLabel(newCabin)) }),
      );
      const params = new URLSearchParams(searchParams.toString());
      params.set("prefClass", newCabin);
      params.set("class", newCabin);
      params.set("cabin", newCabin);
      params.set("page", "1");
      router.push(`/flights/result?${params.toString()}`);
    });
  };

  const [openFilters, setOpenFilters] = useState(false);
  const [openAiTips, setOpenAiTips] = useState(false);

  const [localBids, setLocalBids] = useState<Record<string, any>>({});

  const displayFlights = useMemo(() => {
    let mapped = initialFlights;
    if (Object.keys(localBids).length > 0) {
      mapped = initialFlights.map((flight) => {
        const bidData = localBids[flight.flightId];
        if (bidData) {
          const adults = parseInt(searchParams.get("adt") || "1", 10);
          const children = parseInt(searchParams.get("chd") || "0", 10);
          const infants = parseInt(searchParams.get("inf") || "0", 10);

          const adtFare = Number(bidData.bidAdtPrice ?? 0);
          const chdFare = Number(bidData.bidChdPrice ?? adtFare);
          const infFare = Number(bidData.bidInfPrice ?? 0);

          const newTotal =
            adults * adtFare + children * chdFare + infants * infFare;

          return {
            ...flight,
            totalCost: newTotal,
            baseFare: newTotal,
            fareInUSD: flight.fareInUSD
              ? {
                  ...flight.fareInUSD,
                  totalFare: newTotal,
                  baseFare: newTotal,
                }
              : undefined,
            cheapBidApplied: {
              bidId: bidData.id,
              bidToken: String(bidData.id),
              originalTotal: flight.totalCost,
              bidAdtPrice: bidData.bidAdtPrice,
              bidChdPrice: bidData.bidChdPrice,
              bidInfPrice: bidData.bidInfPrice,
              originalAdtPrice: bidData.originalAdtPrice,
              originalChdPrice: bidData.originalChdPrice,
              originalInfPrice: bidData.originalInfPrice,
              linkExpiryDate: bidData.linkExpiryDate,
            },
          };
        }
        return flight;
      });
    }
    // unique set of flights
    // Uniqueness deduplication disabled as requested to show all flights
    /*
    const seen = new Set<string>();
    return mapped.filter((flight) => {
      const outLegs =
        flight.outbound
          ?.map(
            (s) =>
              `${s.airline?.code || ""}_${s.flightNo}_${s.fromAirport?.code || ""}_${s.toAirport?.code || ""}_${s.departureDate || ""}_${s.arrivalDate || ""}_${s.cabinClass || ""}`,
          )
          .join("|") || "";
      const inLegs =
        flight.inbound
          ?.map(
            (s) =>
              `${s.airline?.code || ""}_${s.flightNo}_${s.fromAirport?.code || ""}_${s.toAirport?.code || ""}_${s.departureDate || ""}_${s.arrivalDate || ""}_${s.cabinClass || ""}`,
          )
          .join("|") || "";
      const key = `${flight.airline?.code || ""}_${flight.totalCost}_${flight.currency || ""}_${flight.totalTime || ""}_${flight.stops || 0}_${outLegs}_${inLegs}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    */
    return mapped;
  }, [initialFlights, localBids, searchParams]);

  const effectiveError = error;
  const friendlyError = useMemo(() => {
    if (!effectiveError) return null;
    return getFriendlyError(effectiveError);
  }, [effectiveError]);
  const { setFlights, clearAddons } = useBookingFlowStore((state) => ({
    setFlights: state.setFlights,
    clearAddons: state.clearAddons,
  }));
  const {
    startLoading,
    stopLoading,
    isLoading: globalIsLoading,
  } = useLoadingStore();
  const [isPending, startTransition] = useTransition();
  const [isSorting, startSortTransition] = useTransition();

  // isPageReady starts false so the toolbar/sidebar are never rendered on the
  // first paint (all Zustand flags default to false before useEffects fire).
  // It becomes true only after stopLoading() has actually executed.
  const [isPageReady, setIsPageReady] = useState(false);

  const { data: session } = useAuthSession();
  const [myInquiries, setMyInquiries] = useState<FlightInquiry[]>([]);
  const [adminBidFlight, setAdminBidFlight] = useState<FlightListItem | null>(
    null,
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const scrollRoot = resultsScrollRef.current;
    if (!scrollRoot) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      { root: scrollRoot, rootMargin: "0px", threshold: 0 },
    );

    const currentRef = bottomRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayFlights]);

  // useEffect(() => {
  //   if (session) {
  //     getMyInquiries()
  //       .then((res) => {
  //         if (Array.isArray(res)) setMyInquiries(res);
  //       })
  //       .catch(console.error);
  //   }
  // }, [session]);

  const bookedFlightKeys = useMemo(() => {
    const keys = new Set<string>();
    myInquiries.forEach((inq) => {
      if (inq.flightSnapshot && inq.status !== "CLOSED") {
        const fn = (inq.flightSnapshot as any).flightNumber;
        const dep = (inq.flightSnapshot as any).departureAt;
        if (fn && dep) {
          keys.add(`${fn}-${new Date(dep).getTime()}`);
        }
      }
    });
    return keys;
  }, [myInquiries]);

  const handleReload = () => {
    startLoading("Searching flights...");
    startTransition(() => {
      router.refresh();
    });
  };

  useEffect(() => {
    if (isPending || isLoading) {
      setIsPageReady(false);
      startLoading("Searching flights...");
    } else {
      const timer = setTimeout(() => {
        stopLoading();
        setIsPageReady(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isPending, isLoading, initialFlights, startLoading, stopLoading]);

  const basePrice = useMemo(() => {
    if (displayFlights.length === 0) return 0;
    return Math.min(...displayFlights.map((f) => f.totalCost));
  }, [displayFlights]);

  const cachedAgoLabel = useMemo(() => {
    if (!fromCache || !cachedAt) return null;
    const diffMs = Date.now() - new Date(cachedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    return `${diffMins} min ago`;
  }, [fromCache, cachedAt]);

  const setCacheStatus = useCacheIndicatorStore((s) => s.setCacheStatus);
  useEffect(() => {
    setCacheStatus(!!fromCache, cachedAgoLabel);
    return () => setCacheStatus(false, null);
  }, [fromCache, cachedAgoLabel, setCacheStatus]);

  const availableAirlinesCount = useMemo(() => {
    const codes = new Set(
      displayFlights
        .map((f) => f.airline?.code || (f as any).airlineCode)
        .filter(Boolean),
    );
    console.log(
      "[FlightSearchContainer] Number of available airlines in search results:",
      codes.size,
    );
    return codes.size;
  }, [displayFlights]);

  const departureDate = useMemo(() => {
    return searchParams.get("dDate") || new Date().toISOString().split("T")[0];
  }, [searchParams]);

  const flightCurrency = useMemo(() => {
    return displayFlights[0]?.currency || "USD";
  }, [displayFlights]);

  // URL destination is available immediately; do not wait for flight results
  const route = useMemo(() => {
    const urlOrigin = normalizeDestinationCode(searchParams.get("org"));
    const urlDestination = normalizeDestinationCode(searchParams.get("des"));

    if (urlOrigin && urlDestination) {
      return { origin: urlOrigin, destination: urlDestination };
    }

    if (displayFlights.length === 0) {
      return {
        origin: urlOrigin || "Origin",
        destination: urlDestination || "",
      };
    }

    const firstLeg = displayFlights[0].outbound[0];
    const lastLeg =
      displayFlights[0].outbound[displayFlights[0].outbound.length - 1];
    return {
      origin:
        urlOrigin || firstLeg.fromAirport.cityCode || firstLeg.fromAirport.code,
      destination:
        urlDestination || lastLeg.toAirport.cityCode || lastLeg.toAirport.code,
    };
  }, [displayFlights, searchParams]);

  useEffect(() => {
    if (route.destination.length === 3) {
      beginDestinationInsightsSearch(route.destination);
    }
  }, [route.destination]);

  // useEffect(() => {
  //   const fetchDeal = async () => {
  //     try {
  //       const deal = await getBidDeal(route.origin, route.destination);
  //       setStandbyDeal(deal);
  //     } catch (err) {
  //       // Log as warning instead of error to avoid triggering Next.js dev error overlay
  //       console.warn(
  //         "Standby deal not available:",
  //         err instanceof Error ? err.message : String(err),
  //       );
  //     }
  //   };
  //   fetchDeal();
  // }, [route]);

  React.useEffect(() => {
    resetFilters();
    const classParam = searchParams.get("class");
    if (classParam?.toLowerCase() === "all") {
      return;
    }
    const normalized = prefClass?.trim().toUpperCase();
    if (normalized && normalized !== "ALL") {
      setFilter("cabinClass", [normalized]);
    }
  }, [
    resetFilters,
    prefClass,
    setFilter,
    searchParams.get("org"),
    searchParams.get("des"),
    searchParams.get("dDate"),
    searchParams.get("rDate"),
    searchParams.get("trip"),
    searchParams.get("class"),
  ]);

  // Clear previously selected add-ons when performing a new search
  React.useEffect(() => {
    clearAddons();
  }, [route.destination, clearAddons]);

  React.useEffect(() => {
    if (displayFlights.length > 0) {
      const prices = displayFlights.map((f) => f.totalCost);
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      const current = filters.priceRange;

      if (!current || current[0] !== min || current[1] !== max) {
        setFilter("priceRange", [min, max]);
      }
    }
  }, [displayFlights, setFilter, filters.priceRange]);

  // useDeferredValue defers the expensive re-filter to a background render so
  // clicking an airline filter feels instant and doesn't block the main thread.
  const deferredFilters = useDeferredValue(filters);
  const isFiltering = filters !== deferredFilters;

  const filteredFlights = useMemo(
    () => filterFlights(displayFlights, deferredFilters),
    [displayFlights, deferredFilters],
  );

  const hasBids = useMemo(() => {
    return filteredFlights.some((f) => f.cheapBidApplied);
  }, [filteredFlights]);

  useEffect(() => {
    if (sortMode === "bid" && !hasBids) {
      setSortMode("cheapest");
    }
  }, [hasBids, sortMode]);

  const sortedFlights = useMemo(() => {
    let flights = [...filteredFlights];
    if (sortMode === "bid") {
      flights = flights.filter((f) => f.cheapBidApplied);
    }
    if (sortMode === "cheapest" || sortMode === "bid") {
      return flights.sort((a, b) => a.totalCost - b.totalCost);
    }
    if (sortMode === "fastest" || sortMode === "duration") {
      return flights.sort((a, b) => a.totalTime - b.totalTime);
    }
    return flights.sort(
      (a, b) => a.totalCost / 5 + a.totalTime - (b.totalCost / 5 + b.totalTime),
    );
  }, [filteredFlights, sortMode]);

  const [localPage, setLocalPage] = useState(currentPage);

  useEffect(() => {
    setLocalPage(currentPage);
  }, [currentPage]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(sortedFlights.length / pageSize));
  const safePage = Math.min(Math.max(localPage, 1), totalPages);
  const paginatedFlights = sortedFlights.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handlePageChange = (newPage: number) => {
    setLocalPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    window.history.replaceState(null, "", `?${params.toString()}`);

    if (resultsScrollRef.current) {
      resultsScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)_380px] lg:grid-rows-1 gap-3 md:gap-0 min-h-0 max-md:h-auto md:h-full md:max-h-full">
      {/* Mobile sticky controls: hidden until page is fully ready */}
      {!multiCitySegments &&
        isPageReady &&
        !isPending &&
        !isLoading &&
        !globalIsLoading && (
          <div
            className={cn(
              "sticky z-30 col-span-full lg:hidden",
              "top-0",
              "-mx-4 px-4 py-2",
              "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70",
              "border-b border-border/40",
            )}
          >
            <div className="flex rounded-[10px] bg-muted/60 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              <button
                onClick={() => setOpenFilters(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-[13px] font-semibold text-foreground active:bg-background active:shadow-sm transition-all duration-150"
              >
                <SlidersHorizontal
                  className="h-3.5 w-3.5 text-foreground/80"
                  strokeWidth={2.25}
                />
                {t("Filters")}
              </button>
              <div className="w-px bg-border/50 my-1.5 shrink-0" aria-hidden />
              <button
                onClick={() => setOpenAiTips(true)}
                className="flex-1 md:hidden lg:flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-[13px] font-semibold text-foreground active:bg-background active:shadow-sm transition-all duration-150"
              >
                {/* <Sparkles
                className="h-3.5 w-3.5 text-redmix dark:text-white"
                strokeWidth={2.25}
              /> */}
                {t("AI Insight")}
              </button>
            </div>
          </div>
        )}

      {/* Column 1: Filters (Desktop) — skeleton until page is ready */}
      <div className="hidden lg:block min-h-0 md:h-full md:max-h-full overflow-y-auto overscroll-contain no-scrollbar border-r border-border/50">
        {isPageReady && !isPending && !isLoading && !globalIsLoading ? (
          <FlightFilterSidebar
            flights={displayFlights}
            airlineSummary={airlineSummary}
            resultsCount={sortedFlights.length}
            sourceCurrency={flightCurrency}
          />
        ) : (
          <FilterSidebarSkeleton />
        )}
      </div>

      {/* Column 2: Main Results */}
      <main className="relative flex min-h-0 min-w-0 max-md:h-auto flex-col max-md:overflow-visible md:h-full md:max-h-full md:overflow-hidden md:py-0">
        {multiCitySegments ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-redmix">
                {t("Multi-City Package Search")}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
                {t("Your Premium Multi-City Travel Package")}
              </h1>
              <p className="text-xs text-muted-foreground leading-normal">
                {t(
                  "We have combined flight options from all segments into a single, seamless booking package.",
                )}
              </p>
            </div>

            {(() => {
              const selectedFlights = multiCitySegments
                .map((seg) => seg.flights[0])
                .filter(Boolean);

              if (selectedFlights.length === 0) {
                return (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
                    <p className="text-4xl">🛫</p>
                    <h3 className="text-xl font-semibold">
                      {t("No flights found for this package")}
                    </h3>
                    <p className="text-sm text-foreground/90 pb-2">
                      {t("Try modifying your search dates or destinations.")}
                    </p>
                    <Button
                      onClick={handleReload}
                      variant="outline"
                      className="rounded-xl font-bold h-11 px-6 gap-2 border-2 hover:bg-redmix hover:text-white hover:border-redmix transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t("Reload Search")}
                    </Button>
                  </div>
                );
              }

              const overallTotalCost = selectedFlights.reduce(
                (acc, f) => acc + f.totalCost,
                0,
              );
              const currency = selectedFlights[0]?.currency || "USD";

              const fmtTime = (iso: string) => {
                if (!iso) return "--:--";
                return new Date(iso).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              };

              return (
                <article className="relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all mb-3 group">
                  <div className="flex flex-col xl:flex-row">
                    {/* Left content: all segments (legs) */}
                    <div className="flex-1 p-3 lg:p-5 flex flex-col gap-4">
                      {multiCitySegments.map((segData, index) => {
                        const { segment, flights } = segData;
                        const flight = flights[0];

                        if (!flight) return null;

                        const firstLeg = flight.outbound?.[0];
                        const lastLeg =
                          flight.outbound?.[flight.outbound.length - 1] ||
                          firstLeg;

                        if (!firstLeg) return null;

                        const airlineName =
                          flight.airline?.name ||
                          firstLeg.airline?.name ||
                          "Airline";
                        const airlineCode =
                          flight.airline?.code ||
                          firstLeg.airline?.code ||
                          "AI";
                        const stops = Math.max(0, flight.outbound.length - 1);

                        const overnight =
                          lastLeg?.arrivalDate && firstLeg?.departureDate
                            ? new Date(lastLeg.arrivalDate).getDate() !==
                              new Date(firstLeg.departureDate).getDate()
                            : false;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "space-y-2",
                              index > 0 &&
                                "pt-4 border-t border-dashed border-border",
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-muted/50 p-1 border border-border/50 flex items-center justify-center shrink-0">
                                  <AirlineLogo
                                    code={airlineCode}
                                    name={airlineName}
                                    className="h-full w-full object-contain"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate">
                                    {airlineName}
                                  </p>
                                  {/* <p className="text-[10px] text-foreground font-bold tracking-widest leading-none">
                                    {flight.flightId || `EF-${flight.flightId.slice(0, 4)}`}
                                  </p> */}
                                </div>
                              </div>
                            </div>

                            <FlightLeg
                              from={firstLeg.fromAirport.code}
                              fromName={firstLeg.fromAirport.name}
                              fromTime={fmtTime(firstLeg.departureDate)}
                              fromIso={firstLeg.departureDate}
                              to={lastLeg.toAirport.code}
                              toName={lastLeg.toAirport.name}
                              toTime={fmtTime(lastLeg.arrivalDate)}
                              durationMins={calculateLegDuration(
                                flight.outbound,
                              )}
                              stops={stops}
                              stopCodes={flight.outbound
                                .slice(0, -1)
                                .map((s) => s.toAirport.code)}
                              overnight={overnight}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Right content: combined select & booking always stacked in single column */}
                    <div className="w-full xl:w-60 dark:bg-muted/20 border-t xl:border-t-0 xl:border-l border-border p-5 flex flex-col justify-center items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1.5">
                          {t("Total Price")}
                        </p>
                        <CurrencyDisplay
                          amount={overallTotalCost}
                          currency={currency}
                          className="items-center"
                          showComparison={false}
                        />
                      </div>
                      <Button
                        className="w-full bg-redmix text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all max-w-[200px]"
                        onClick={() => {
                          const flightIds = selectedFlights
                            .map((f) => f.flightId)
                            .filter(Boolean);
                          setFlights(flightIds);

                          const params = new URLSearchParams(
                            searchParams.toString(),
                          );
                          params.set("id", flightIds.join(","));
                          params.set("trip", "multi-city");

                          const route = selectedFlights
                            .map((f) => f.outbound?.[0]?.fromAirport.code)
                            .filter(Boolean)
                            .concat(
                              selectedFlights[selectedFlights.length - 1]
                                ?.outbound?.[
                                selectedFlights[selectedFlights.length - 1]
                                  .outbound.length - 1
                              ]?.toAirport.code,
                            )
                            .filter(Boolean)
                            .join(" → ");

                          params.set("org", route || "Multi-City");
                          params.set("des", "");

                          router.push(
                            `/flights/booking?${params.toString()}` as any,
                          );
                        }}
                      >
                        {t("Select")}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })()}
          </div>
        ) : (
          <>
            {/* Desktop toolbar — hidden until page is fully ready */}
            {isPageReady && !isPending && !isLoading && !globalIsLoading && (
              <div className="hidden md:block shrink-0 md:px-5 md:py-1 md:space-y-2">
                <FlightAirlineMatrix
                  flights={displayFlights}
                  airlineSummary={airlineSummary}
                  className="mb-2"
                />

                <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-2xl border border-border bg-card px-2 py-2 md:shadow-none shadow-sm">
                  <p className="text-xs font-semibold text-foreground capitalize">
                    {sortedFlights.length} {t("Flights Found")}
                    {/* {safePage} {t("of")} {totalPages} */}
                  </p>
                  <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
                    {/* <span className="text-[10px] font-bold text-muted-foreground  tracking-wider mr-2">
                      {t("Sorted By")}
                    </span> */}
                    {SORT_OPTIONS.filter(
                      (item) => item !== "bid" || hasBids,
                    ).map((item) => (
                      <button
                        key={item}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium uppercase transition-all border shrink-0",
                          sortMode === item
                            ? "bg-redmix text-white border-redmix shadow-sm"
                            : "bg-transparent text-foreground border-border",
                        )}
                        onClick={() => setSortMode(item)}
                      >
                        {t(item)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div
              ref={resultsScrollRef}
              className="max-md:overflow-visible md:h-0 md:min-h-0 md:flex-1 md:overflow-y-auto overscroll-contain scroll-smooth"
            >
              {!isPageReady || isPending || globalIsLoading || isLoading ? (
                <FlightResultSkeleton embedded />
              ) : sortedFlights.length === 0 ? (
                (() => {
                  const mappedSuggestedCabin = suggestedCabin
                    ? cabinMap[suggestedCabin.toUpperCase()] || "Economy"
                    : undefined;

                  if (
                    mappedSuggestedCabin &&
                    !effectiveError &&
                    sortMode !== "bid"
                  ) {
                    return (
                      <div className="rounded-3xl border border-border/40 bg-white/40 dark:bg-card/40 backdrop-blur-md p-8 md:p-12 text-center shadow-lg shadow-black/[0.03] space-y-6 my-2 mx-1 flex flex-col items-center">
                        <div className="space-y-2 max-w-md">
                          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                            <span className="inline-block animate-bounce">
                              💺
                            </span>
                            {t("Cabin Class Not Available")}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("Your searched cabin")}{" "}
                            <span className="font-semibold text-foreground">
                              {formatCabinClassLabel(prefClass)}
                            </span>{" "}
                            {t("is not available on this route.")}
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {t("Would you like to search in")}{" "}
                            <span className="text-redmix font-semibold underline decoration-2 decoration-redmix/30">
                              {formatCabinClassLabel(mappedSuggestedCabin)}
                            </span>{" "}
                            {t("instead?")}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-md">
                          <Button
                            onClick={() =>
                              handleSearchSuggestedCabin(mappedSuggestedCabin)
                            }
                            className="w-full sm:w-auto rounded-xl font-bold h-11 px-8 gap-2 bg-redmix hover:brightness-110 text-white shadow-md shadow-redmix/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <Zap className="w-4 h-4 fill-current animate-pulse" />
                            {t("Search")}{" "}
                            {formatCabinClassLabel(mappedSuggestedCabin)}
                          </Button>
                          <Button
                            onClick={handleReload}
                            className="w-full sm:w-auto rounded-xl font-bold h-11 px-6 gap-2 bg-background border border-border hover:bg-muted text-foreground transition-all duration-200"
                          >
                            <RefreshCw className="w-4 h-4" />
                            {t("Reload Search")}
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="rounded-3xl border border-border/40 bg-white/40 dark:bg-card/40 backdrop-blur-md p-8 md:p-12 text-center shadow-lg shadow-black/[0.03] space-y-4 my-2 mx-1 flex flex-col items-center mb-10">
                      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                        {sortMode === "bid" && !effectiveError
                          ? t("No bid flights found")
                          : friendlyError
                            ? t(friendlyError.title)
                            : t("No flights found")}
                      </h3>
                      <p className="text-sm text-foreground/80 font-medium max-w-sm">
                        {sortMode === "bid" && !effectiveError
                          ? t(
                              "No flights on this search have an active cheap bid. Try another date or route.",
                            )
                          : friendlyError
                            ? t(friendlyError.description)
                            : t("Try modifying your filters or search dates.")}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none">
                        {!effectiveError && (
                          <Button
                            onClick={() => setOpenFilters(true)}
                            className="w-full sm:w-auto rounded-xl font-bold h-11 px-6 lg:hidden bg-background border border-border hover:bg-muted text-foreground transition-all duration-200"
                          >
                            {t("Modify filters")}
                          </Button>
                        )}
                        <Button
                          onClick={handleReload}
                          className="w-full sm:w-auto rounded-xl font-bold h-11 px-6 gap-2 bg-redmix hover:brightness-110 text-white shadow-md shadow-redmix/10 transition-all duration-200"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {effectiveError
                            ? t("Return to Search")
                            : t("Reload Search")}
                        </Button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="relative space-y-3 mt-2 md:px-5 pb-20 md:pb-4">
                  {/* Airline-filter loading overlay — shown while deferred re-filter is pending */}
                  {(isSorting || isFiltering) && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-start pt-24 rounded-2xl bg-background/60 backdrop-blur-[2px] pointer-events-none">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-9 w-9 rounded-full border-4 border-redmix/30 dark:border-white/30 border-t-redmix dark:border-t-white animate-spin" />
                        <p className="text-xs md:text-sm font-semibold text-redmix dark:text-white">
                          {t("Filtering flights…")}
                        </p>
                      </div>
                    </div>
                  )}
                  {paginatedFlights.map((flight, index) => (
                    <motion.div
                      key={flight.flightId || index}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FlightCard
                        flight={flight}
                        isBooked={bookedFlightKeys.has(
                          `${flight.outbound?.[0]?.flightNo}-${new Date(
                            flight.outbound?.[0]?.departureDate || "",
                          ).getTime()}`,
                        )}
                        onTryBid={setAdminBidFlight}
                      />
                    </motion.div>
                  ))}

                  {/* Scroll Indicator */}
                  {!isAtBottom && displayFlights.length > 0 && (
                    <div className="sticky bottom-4 md:bottom-0 w-full flex justify-center pointer-events-none z-10 pb-2">
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut",
                        }}
                        className="bg-background border border-border text-foreground p-1.5 rounded-full shadow-md opacity-80"
                      >
                        <ChevronDown className="w-5 h-5 text-redmix" />
                      </motion.div>
                    </div>
                  )}

                  {/* Invisible element at the bottom to detect when we've reached the end */}
                  <div ref={bottomRef} className="h-4 w-full" />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="w-20 sm:w-24">
                        {safePage > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(safePage - 1)}
                            className="rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4"
                          >
                            ← {t("Back")}
                          </Button>
                        )}
                      </div>

                      <span className="text-xs sm:text-sm font-semibold text-foreground/90">
                        {t("Page")} {safePage} {t("of")} {totalPages}
                      </span>

                      <div className="w-20 sm:w-24 flex justify-end">
                        {safePage < totalPages && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(safePage + 1)}
                            className="rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4"
                          >
                            {t("Next")} →
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Column 3: AI Suggestions (md+ sidebar) */}
      <div className="hidden md:block min-h-0 md:h-full md:max-h-full py-4 border-l border-border/40 overflow-y-auto overscroll-contain no-scrollbar">
        {isPageReady && !isPending && !isLoading && !globalIsLoading ? (
          <FlightAiSuggestionsPanel
            variant="sheet"
            flights={sortedFlights}
            origin={route.origin}
            destination={route.destination}
          />
        ) : (
          <AiSidebarSkeleton />
        )}
      </div>

      {/* Mobile Drawer: Filters */}
      <Drawer.Root open={openFilters} onOpenChange={setOpenFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] border-t border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none">
            <Drawer.Title className="sr-only">
              {t("Flight Filters")}
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              {t("Adjust your flight search results using various filters.")}
            </Drawer.Description>
            <div className="mx-auto mt-2.5 mb-3 h-[5px] w-9 shrink-0 rounded-full bg-foreground/20" />
            <div className="px-4 mb-3 md:hidden shrink-0">
              <FlightAirlineMatrix
                flights={displayFlights}
                airlineSummary={airlineSummary}
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <FlightFilterSidebar
                onClose={() => setOpenFilters(false)}
                flights={displayFlights}
                airlineSummary={airlineSummary}
                resultsCount={sortedFlights.length}
                sortMode={sortMode}
                onSortChange={setSortMode}
                sourceCurrency={flightCurrency}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Mobile Drawer: AI Tips */}
      <Drawer.Root open={openAiTips} onOpenChange={setOpenAiTips}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] border-t border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none">
            <Drawer.Title className="sr-only">
              {t("AI Suggestions")}
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              {t("AI-powered insights and tips for your flight selection.")}
            </Drawer.Description>
            <div className="mx-auto mt-2.5 mb-3 h-[5px] w-9 shrink-0 rounded-full bg-foreground/20" />
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <FlightAiSuggestionsPanel
                variant="sheet"
                onClose={() => setOpenAiTips(false)}
                flights={sortedFlights}
                origin={route.origin}
                destination={route.destination}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <FlightSearchCheapBidModal
        flight={adminBidFlight}
        open={!!adminBidFlight}
        onOpenChange={(open) => {
          if (!open) setAdminBidFlight(null);
        }}
        searchedOrigin={searchParams.get("org") || undefined}
        searchedDestination={searchParams.get("des") || undefined}
        onBidCreated={(data) => {
          if (adminBidFlight?.flightId) {
            setLocalBids((prev) => ({
              ...prev,
              [adminBidFlight.flightId]: data,
            }));
          }
          startLoading(t("Refetching latest flight prices & bid data..."));
          startTransition(() => {
            router.refresh();
            setTimeout(() => {
              stopLoading();
            }, 1200);
          });
        }}
      />
    </div>
  );
}
