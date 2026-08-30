"use client";

import * as React from "react";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { useSaveLocalSearch, useLocalRecentSearches } from "@/lib/api/search";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useRecentSearchStore } from "@/lib/store/recent-search-store";
import { parseISO } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/ui/location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/PassengerSelector";
import { CounterInput } from "@/components/ui/CounterInput";
import { TimePicker } from "@/components/ui/time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/hooks/use-toast";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { useTranslation } from "react-i18next";
import {
  applyFlightSearchCabinParams,
  resolvePreferredCabinClass,
} from "@/lib/utils/cabin-class";
import {
  beginDestinationInsightsSearch,
  prefetchDestinationInsights,
  seedDestinationInsightsCache,
} from "@/lib/api/destination-insights";
import { normalizeDestinationCode } from "@/lib/store/destination-insights-store";
import { RecentSearches } from "./sections/RecentSearches";

const MemoizedRecentSearches = React.memo(RecentSearches);

function extractAirportCode(value: string): string {
  if (!value) return "";
  const match = value.match(/\(([^)]+)\)/);
  if (match && match[1] && match[1].length === 3) {
    return match[1].toUpperCase();
  }
  const trimmed = value.trim().toUpperCase();
  if (trimmed.length === 3) {
    return trimmed;
  }
  return trimmed;
}

const TABS = [
  { id: "flights", label: "Flights", emoji: "✈" },
  { id: "hotels", label: "Hotels", emoji: "🏨" },
  { id: "cars", label: "Cars", emoji: "🚗" },
  // { id: "packages", label: "Packages", emoji: "📦" },
  // { id: "transfers", label: "Transfers", emoji: "🚌" },
] as const;

const TRIP_TYPES = ["one-way", "round-trip"] as const;
// const TRIP_TYPES = ["one-way", "round-trip", "multi-city"] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 20,
      delay: 0.05,
    },
  },
};

const tabVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

type TabType = (typeof TABS)[number]["id"];

/** Hotel stays require at least one night — check-out is the day after check-in at minimum. */
function minHotelCheckOutDate(checkIn: Date): Date {
  return startOfDay(addDays(checkIn, 1));
}

function isOnOrBeforeCheckOut(checkOut: Date, checkIn: Date): boolean {
  return startOfDay(checkOut) <= startOfDay(checkIn);
}

export function BookingForm({
  defaultTab = "flights",
  heroMode = true,
  animateIn = false,
  onSearch,
  onSubmit,
}: {
  defaultTab?: TabType;
  heroMode?: boolean;
  animateIn?: boolean;
  onSearch?: () => void;
  onSubmit?: (params: URLSearchParams) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const saveSearchMutation = useSaveLocalSearch();
  const { prefill, clearPrefill } = useRecentSearchStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const startLoading = useLoadingStore((state) => state.startLoading);

  const [invalidFields, setInvalidFields] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // URL-persistent tab state using local state to avoid Next.js router transition lag
  const [activeTab, setActiveTab] = React.useState<TabType>(
    (searchParams.get("tab") as TabType) || defaultTab,
  );

  // Sync state if URL changes externally
  React.useEffect(() => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/?${params.toString()}` as any, { scroll: false });
  };

  const { data: dbSearches = [] } = useLocalRecentSearches();

  // Initial values from URL if present
  const [origin, setOrigin] = React.useState(searchParams.get("org") || "");
  const [destination, setDestination] = React.useState(
    searchParams.get("des") || searchParams.get("city") || "",
  );

  // Parse dates from URL or default to undefined
  const urlDDate = searchParams.get("dDate") || searchParams.get("checkInDate");
  const urlRDate =
    searchParams.get("rDate") || searchParams.get("checkOutDate");

  const isValidDate = (d: any): d is Date =>
    d instanceof Date && !isNaN(d.getTime());

  const [tripType, setTripType] = React.useState<(typeof TRIP_TYPES)[number]>(
    (searchParams.get("trip") as any) || "round-trip",
  );

  const [departDate, setDepartDate] = React.useState<Date | undefined>(() => {
    if (urlDDate) {
      const parsed = parseISO(urlDDate);
      if (isValidDate(parsed)) {
        const minDate = startOfDay(addDays(new Date(), 2));
        if (activeTab === "flights" && isBefore(startOfDay(parsed), minDate)) {
          return minDate;
        }
        return parsed;
      }
    }
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  });

  const [returnDate, setReturnDate] = React.useState<Date | undefined>(() => {
    if (urlRDate) {
      const parsed = parseISO(urlRDate);
      if (isValidDate(parsed)) {
        if (
          departDate &&
          isValidDate(departDate) &&
          isBefore(startOfDay(parsed), startOfDay(departDate))
        ) {
          return departDate;
        }
        return parsed;
      }
    }
    // Default return date to 7 days after departure date if trip type is round-trip
    if (tripType === "round-trip" && departDate) {
      return addDays(departDate, 7);
    }
    return undefined;
  });

  const [transferTime, setTransferTime] = React.useState("12:00");
  const [cabinClass, setCabinClass] = React.useState(() =>
    resolvePreferredCabinClass(
      searchParams.get("prefClass"),
      searchParams.get("class"),
    ),
  );

  // jetcost
  const [jetcost, setJetcost] = React.useState<string>(
    searchParams.get("jetcost") || "",
  );

  const [passengers, setPassengers] = React.useState({
    adults: parseInt(searchParams.get("adt") || "1"),
    children: parseInt(searchParams.get("chd") || "0"),
    infants: parseInt(searchParams.get("inf") || "0"),
  });

  const [rooms, setRooms] = React.useState(
    parseInt(searchParams.get("rooms") || "1"),
  );
  const [guests, setGuests] = React.useState(
    parseInt(searchParams.get("adults") || "1"),
  );
  const [pickupTime, setPickupTime] = React.useState<string>("10:00");
  const [dropoffTime, setDropoffTime] = React.useState<string>("10:00");
  const [differentDropoff, setDifferentDropoff] =
    React.useState<boolean>(false);
  const [swapRotate, setSwapRotate] = React.useState(0);

  // Start loading AI insights as soon as user picks a 3-letter destination (before Search click)
  React.useEffect(() => {
    if (activeTab !== "flights") return;
    const code = normalizeDestinationCode(destination);
    if (code.length !== 3) return;
    seedDestinationInsightsCache(code);
    const timer = setTimeout(() => beginDestinationInsightsSearch(code), 350);
    return () => clearTimeout(timer);
  }, [destination, activeTab]);

  // Auto-populate hotel check-out whenever check-in is set but check-out is missing
  React.useEffect(() => {
    if (activeTab !== "hotels") return;
    if (departDate && !returnDate) {
      setReturnDate(minHotelCheckOutDate(departDate));
    }
  }, [activeTab, departDate, returnDate]);

  // Ensure return date / check-out is not earlier than depart / check-in date
  React.useEffect(() => {
    if (!departDate) return;

    if (activeTab === "hotels") {
      if (!returnDate) {
        setReturnDate(minHotelCheckOutDate(departDate));
      } else if (isOnOrBeforeCheckOut(returnDate, departDate)) {
        setReturnDate(minHotelCheckOutDate(departDate));
      }
    } else if (activeTab === "flights") {
      if (tripType === "round-trip") {
        if (!returnDate) {
          setReturnDate(addDays(departDate, 7));
        } else if (isBefore(startOfDay(returnDate), startOfDay(departDate))) {
          setReturnDate(addDays(departDate, 7));
        }
      }
    } else {
      if (
        returnDate &&
        isBefore(startOfDay(returnDate), startOfDay(departDate))
      ) {
        setReturnDate(departDate);
      }
    }
  }, [departDate, returnDate, activeTab, tripType]);

  const [multiCitySegments, setMultiCitySegments] = React.useState([
    { origin: "", destination: "", departDate: undefined as Date | undefined },
    { origin: "", destination: "", departDate: undefined as Date | undefined },
  ]);

  const handleSegmentChange = (index: number, field: string, value: any) => {
    setMultiCitySegments((prev) => {
      const next = prev.map((seg, idx) =>
        idx === index ? { ...seg, [field]: value } : seg,
      );

      const currentSeg = next[index];
      const segOriginCode = extractAirportCode(currentSeg.origin);
      const segDestCode = extractAirportCode(currentSeg.destination);
      if (segOriginCode && segDestCode && segOriginCode === segDestCode) {
        if (field === "origin") {
          currentSeg.destination = "";
        } else {
          currentSeg.origin = "";
        }
      }

      if (field === "destination" && next[index + 1]) {
        next[index + 1] = { ...next[index + 1], origin: value };
      }
      return next;
    });
  };

  const addSegment = () => {
    if (multiCitySegments.length < 6) {
      const lastDest =
        multiCitySegments[multiCitySegments.length - 1]?.destination || "";
      setMultiCitySegments((prev) => [
        ...prev,
        { origin: lastDest, destination: "", departDate: undefined },
      ]);
    }
  };

  const removeSegment = (index: number) => {
    if (multiCitySegments.length > 2) {
      setMultiCitySegments((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const error = searchParams.get("error");
      if (error === "invalid_date") {
        toast({
          title: t("Invalid Search Date"),
          description: t(
            "Flight departures must be at least 2 days in the future. Please choose a new date.",
          ),
          variant: "destructive",
        });

        // Clean up the URL parameter without reloading
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("error");
        router.replace(`/?${newParams.toString()}` as any, { scroll: false });
      }
    }
  }, [searchParams, toast, t, router]);

  // Prefill effect for manual clicks on Recent Search cards or AI Search
  React.useEffect(() => {
    if (prefill) {
      applySearchToForm(prefill);
      if (prefill.autoSearch) {
        // Use a small delay but pass data DIRECTLY to handleSearch to avoid state race conditions
        const searchDate = prefill.searchDate
          ? parseISO(prefill.searchDate)
          : undefined;
        setTimeout(() => {
          handleSearch({
            origin: prefill.origin,
            destination: prefill.destination,
            departDate: searchDate,
            ...prefill.metadata,
          });
          onSearch?.();
          // Clear only AFTER the search is triggered
          clearPrefill();
        }, 200);
      } else {
        clearPrefill();
      }
    }
  }, [prefill, clearPrefill, onSearch]);

  const prefilledTabs = React.useRef<Set<string>>(new Set());

  // Optional: Auto-prefill from history ONLY on homepage if form is still empty after mount
  React.useEffect(() => {
    console.log(
      "[BookingForm] Auto-prefill effect running. dbSearches count:",
      dbSearches.length,
      "activeTab:",
      activeTab,
    );

    if (prefilledTabs.current.has(activeTab)) {
      console.log(
        "[BookingForm] Skipping because tab",
        activeTab,
        "is already marked as prefilled.",
      );
      return;
    }

    const hasSearchParams = searchParams.get("org") || searchParams.get("des");
    if (hasSearchParams) {
      console.log(
        "[BookingForm] Skipping prefill because URL has search params (org/des).",
      );
      prefilledTabs.current.add(activeTab);
      return;
    }

    if (dbSearches.length === 0) {
      console.log(
        "[BookingForm] dbSearches is empty. Waiting for recent searches to load before marking as prefilled...",
      );
      // DO NOT add to prefilledTabs yet, wait for data to load
      return;
    }

    // Only auto-fill from history if the user hasn't touched the form yet
    if (!origin && !destination) {
      const lastSearchForTab = dbSearches.find(
        (s) => s.searchType === activeTab,
      );
      console.log("[BookingForm] Found lastSearchForTab:", lastSearchForTab);

      if (lastSearchForTab) {
        // Only apply if it's the home page or root directories
        if (
          pathname === "/" ||
          pathname === "/flights" ||
          pathname === "/hotels" ||
          pathname === "/cars"
        ) {
          console.log(
            "[BookingForm] Applying recent search to form:",
            lastSearchForTab,
          );
          applySearchToForm(lastSearchForTab);
        } else {
          console.log(
            "[BookingForm] Not applying because pathname is not a root search page:",
            pathname,
          );
        }
      }
    }
    prefilledTabs.current.add(activeTab);
    console.log("[BookingForm] Marked tab as prefilled/processed:", activeTab);
  }, [
    dbSearches,
    session.data,
    searchParams,
    pathname,
    origin,
    destination,
    activeTab,
  ]);

  const applySearchToForm = (search: any) => {
    let hasPastDate = false;

    if (search.searchType && search.searchType !== activeTab) {
      handleTabChange(search.searchType as TabType);
    }
    setOrigin(search.origin || "");
    setDestination(search.destination || "");

    const today = startOfDay(new Date());

    if (search.searchDate) {
      const parsed =
        typeof search.searchDate === "string"
          ? parseISO(search.searchDate)
          : search.searchDate;

      const minDate =
        activeTab === "flights" ? startOfDay(addDays(new Date(), 2)) : today;

      if (isBefore(startOfDay(parsed), minDate)) {
        hasPastDate = true;
        setDepartDate(minDate);
      } else {
        setDepartDate(parsed);
      }
    }

    if (search.metadata) {
      if (search.metadata.tripType) setTripType(search.metadata.tripType);
      if (search.metadata.cabinClass) setCabinClass(search.metadata.cabinClass);
      if (search.metadata.passengers) setPassengers(search.metadata.passengers);
      if (search.metadata.rooms) setRooms(search.metadata.rooms);
      if (search.metadata.guests) setGuests(search.metadata.guests);
      if (search.metadata.pickupTime) setPickupTime(search.metadata.pickupTime);
      if (search.metadata.dropoffTime)
        setDropoffTime(search.metadata.dropoffTime);
      if (search.metadata.differentDropoff !== undefined) {
        setDifferentDropoff(search.metadata.differentDropoff);
      }
      if (search.metadata.returnDate) {
        const parsedRDate =
          typeof search.metadata.returnDate === "string"
            ? parseISO(search.metadata.returnDate)
            : search.metadata.returnDate;

        const dep = search.searchDate
          ? typeof search.searchDate === "string"
            ? parseISO(search.searchDate)
            : search.searchDate
          : departDate;

        if (isBefore(startOfDay(parsedRDate), today)) {
          hasPastDate = true;
          setReturnDate(undefined);
        } else if (
          search.searchType === "hotels" &&
          dep &&
          isOnOrBeforeCheckOut(parsedRDate, dep)
        ) {
          setReturnDate(minHotelCheckOutDate(dep));
        } else if (dep && isBefore(startOfDay(parsedRDate), startOfDay(dep))) {
          setReturnDate(dep);
        } else {
          setReturnDate(parsedRDate);
        }
      }
    }

    // if (hasPastDate) {
    //   toast({
    //     title: t("Date adjusted"),
    //     description: t(
    //       "Previous dates can't be selected. The dates have been adjusted to today.",
    //     ),
    //     variant: "destructive",
    //   });
    // }
  };

  const handleDepartDateChange = (nextDepartDate: Date | undefined) => {
    setDepartDate(nextDepartDate);

    if (!nextDepartDate) return;

    setReturnDate((prevReturnDate) => {
      if (!prevReturnDate) {
        if (tripType === "round-trip") {
          return addDays(nextDepartDate, 7);
        }
        return prevReturnDate;
      }
      return isBefore(startOfDay(prevReturnDate), startOfDay(nextDepartDate))
        ? tripType === "round-trip"
          ? addDays(nextDepartDate, 7)
          : nextDepartDate
        : prevReturnDate;
    });
  };

  const handleReturnDateChange = (nextReturnDate: Date | undefined) => {
    if (!nextReturnDate) {
      setReturnDate(undefined);
      return;
    }

    if (
      departDate &&
      isBefore(startOfDay(nextReturnDate), startOfDay(departDate))
    ) {
      setReturnDate(departDate);
      return;
    }

    setReturnDate(nextReturnDate);
  };

  const handleHotelCheckInChange = (nextCheckIn: Date | undefined) => {
    setDepartDate(nextCheckIn);
    if (!nextCheckIn) return;

    setReturnDate((prevCheckOut) => {
      if (!prevCheckOut || isOnOrBeforeCheckOut(prevCheckOut, nextCheckIn)) {
        return minHotelCheckOutDate(nextCheckIn);
      }
      return prevCheckOut;
    });
  };

  const handleHotelCheckOutChange = (nextCheckOut: Date | undefined) => {
    if (!nextCheckOut) {
      setReturnDate(undefined);
      return;
    }

    if (departDate && isOnOrBeforeCheckOut(nextCheckOut, departDate)) {
      setReturnDate(minHotelCheckOutDate(departDate));
      return;
    }

    setReturnDate(nextCheckOut);
  };

  const handleSearch = (overrides?: any) => {
    // 1. Define ALL search parameters at the top (Priority: Overrides > Internal State > URL Params)
    const searchOrigin =
      overrides?.origin !== undefined
        ? overrides.origin
        : origin || searchParams.get("org") || "";
    const searchDestination =
      overrides?.destination !== undefined
        ? overrides.destination
        : destination || searchParams.get("des") || "";

    const initialDDate = searchParams.get("dDate");
    const initialRDate = searchParams.get("rDate");

    const searchDepartDate =
      overrides?.departDate !== undefined
        ? overrides.departDate
        : departDate || (initialDDate ? parseISO(initialDDate) : undefined);

    const searchReturnDate =
      overrides?.returnDate !== undefined
        ? overrides.returnDate
        : returnDate || (initialRDate ? parseISO(initialRDate) : undefined);

    const searchPassengers =
      overrides?.passengers !== undefined ? overrides.passengers : passengers;
    const searchCabinClass =
      overrides?.cabinClass !== undefined ? overrides.cabinClass : cabinClass;
    const searchTripType =
      overrides?.tripType !== undefined ? overrides.tripType : tripType;

    const missing: string[] = [];

    // 2. Validation
    if (activeTab === "flights") {
      if (searchTripType === "multi-city") {
        multiCitySegments.forEach((seg, idx) => {
          if (!seg.origin) missing.push(`origin-${idx}`);
          if (!seg.destination) missing.push(`destination-${idx}`);
          if (!seg.departDate) missing.push(`departDate-${idx}`);
        });
      } else {
        if (!searchOrigin) missing.push("origin");
        if (!searchDestination) missing.push("destination");
        if (!searchDepartDate) missing.push("departDate");
        if (searchTripType === "round-trip" && !searchReturnDate)
          missing.push("returnDate");

        if (
          searchTripType === "round-trip" &&
          searchDepartDate &&
          searchReturnDate &&
          isBefore(startOfDay(searchReturnDate), startOfDay(searchDepartDate))
        ) {
          toast({
            title: t("Invalid return date"),
            description: t(
              "Return date cannot be earlier than departure date.",
            ),
            variant: "destructive",
          });
          return;
        }
      }
    } else if (activeTab === "hotels") {
      if (!searchDestination) missing.push("destination");
      if (!searchDepartDate) missing.push("departDate");
      if (!searchReturnDate) missing.push("returnDate");
      if (
        searchDepartDate &&
        searchReturnDate &&
        isOnOrBeforeCheckOut(searchReturnDate, searchDepartDate)
      ) {
        toast({
          title: t("Invalid stay dates"),
          description: t("Check-out must be at least one day after check-in."),
          variant: "destructive",
        });
        return;
      }
    } else if (activeTab === "cars") {
      if (!searchOrigin) missing.push("origin");
      if (differentDropoff && !searchDestination) missing.push("destination");
      if (!searchDepartDate) missing.push("departDate");
      if (!searchReturnDate) missing.push("returnDate");

      if (
        searchDepartDate &&
        searchReturnDate &&
        isBefore(startOfDay(searchReturnDate), startOfDay(searchDepartDate))
      ) {
        toast({
          title: t("Invalid return date"),
          description: t("Drop-off date cannot be earlier than pickup date."),
          variant: "destructive",
        });
        return;
      }
    }

    if (missing.length > 0) {
      setInvalidFields(missing);
      toast({
        title: t("Incomplete Search"),
        description: t("Please fill in all required fields."),
        variant: "destructive",
      });
      setTimeout(() => setInvalidFields([]), 2000);
      return;
    }

    // 3. Additional Flight Validations
    if (activeTab === "flights") {
      // Validate Same Origin and Destination
      if (searchTripType === "multi-city") {
        let hasSameLocation = false;
        const missingLocs: string[] = [];
        setMultiCitySegments((prev) => {
          return prev.map((seg, idx) => {
            const segOriginCode = extractAirportCode(seg.origin);
            const segDestCode = extractAirportCode(seg.destination);
            if (segOriginCode && segDestCode && segOriginCode === segDestCode) {
              hasSameLocation = true;
              missingLocs.push(`destination-${idx}`);
              return { ...seg, destination: "" };
            }
            return seg;
          });
        });
        if (hasSameLocation) {
          setInvalidFields(missingLocs);
          toast({
            title: t("Incomplete Search"),
            description: t("Please fill in all required fields."),
            variant: "destructive",
          });
          setTimeout(() => setInvalidFields([]), 2000);
          return;
        }
      } else {
        const originCode = extractAirportCode(searchOrigin);
        const destCode = extractAirportCode(searchDestination);
        if (originCode && destCode && originCode === destCode) {
          setDestination("");
          setInvalidFields(["destination"]);
          toast({
            title: t("Incomplete Search"),
            description: t("Please fill in all required fields."),
            variant: "destructive",
          });
          setTimeout(() => setInvalidFields([]), 2000);
          return;
        }
      }
    }

    // Validate Airport Codes (must be 3 characters)
    if (activeTab === "flights") {
      if (searchTripType === "multi-city") {
        let hasInvalidCode = false;
        multiCitySegments.forEach((seg, idx) => {
          if (seg.origin && seg.origin.trim().length !== 3) {
            toast({
              title: t("Invalid Airport Code"),
              description: t(
                'Flight {{index}} Origin "{{code}}" is not a valid 3-letter airport code (e.g., LHR, DXB). Please select a code from the list.',
                { index: idx + 1, code: seg.origin },
              ),
              variant: "destructive",
            });
            hasInvalidCode = true;
          }
          if (seg.destination && seg.destination.trim().length !== 3) {
            toast({
              title: t("Invalid Airport Code"),
              description: t(
                'Flight {{index}} Destination "{{code}}" is not a valid 3-letter airport code (e.g., LHR, DXB). Please select a code from the list.',
                { index: idx + 1, code: seg.destination },
              ),
              variant: "destructive",
            });
            hasInvalidCode = true;
          }
        });
        if (hasInvalidCode) return;
      } else {
        if (searchOrigin && searchOrigin.trim().length !== 3) {
          toast({
            title: t("Invalid Airport Code"),
            description: t(
              'Origin "{{code}}" is not a valid 3-letter airport code (e.g., LHR, DXB). Please select a code from the list.',
              { code: searchOrigin },
            ),
            variant: "destructive",
          });
          return;
        }
        if (searchDestination && searchDestination.trim().length !== 3) {
          toast({
            title: t("Invalid Airport Code"),
            description: t(
              'Destination "{{code}}" is not a valid 3-letter airport code (e.g., LHR, DXB). Please select a code from the list.',
              { code: searchDestination },
            ),
            variant: "destructive",
          });
          return;
        }
      }
    }

    const insightsDestination =
      searchTripType === "multi-city"
        ? normalizeDestinationCode(
            multiCitySegments[multiCitySegments.length - 1]?.destination,
          )
        : normalizeDestinationCode(searchDestination);

    // 3. Save Search
    const shouldSave =
      activeTab === "hotels"
        ? Boolean(searchDestination)
        : Boolean(searchOrigin && (searchDestination || insightsDestination));

    if (shouldSave) {
      const searchData = {
        origin: searchOrigin,
        destination: searchDestination,
        searchType: activeTab,
        searchDate: searchDepartDate
          ? format(searchDepartDate, "yyyy-MM-dd")
          : undefined,
        metadata: {
          tripType: searchTripType,
          cabinClass: searchCabinClass,
          passengers: searchPassengers,
          rooms: rooms,
          guests: guests,
          pickupTime: pickupTime,
          dropoffTime: dropoffTime,
          differentDropoff: differentDropoff,
          returnDate:
            (activeTab !== "flights" || searchTripType === "round-trip") &&
            searchReturnDate
              ? format(searchReturnDate, "yyyy-MM-dd")
              : undefined,
        },
      };

      saveSearchMutation.mutate(searchData);
    }

    // 4. Build URL Params
    const params = new URLSearchParams();

    if (activeTab === "hotels") {
      params.set("city", searchDestination);
      if (searchDepartDate)
        params.set("checkInDate", format(searchDepartDate, "yyyy-MM-dd"));
      if (searchReturnDate && searchDepartDate) {
        const finalReturnDate = isOnOrBeforeCheckOut(
          searchReturnDate,
          searchDepartDate,
        )
          ? minHotelCheckOutDate(searchDepartDate)
          : searchReturnDate;
        params.set("checkOutDate", format(finalReturnDate, "yyyy-MM-dd"));
      } else if (searchReturnDate) {
        params.set("checkOutDate", format(searchReturnDate, "yyyy-MM-dd"));
      }
      params.set("adults", guests.toString());
      params.set("rooms", rooms.toString());
      params.set("page", "1");
      params.set("limit", "12");
    } else if (activeTab === "flights") {
      if (searchTripType === "multi-city") {
        params.set("trip", "multi-city");
        params.set("adt", searchPassengers.adults.toString());
        params.set("chd", searchPassengers.children.toString());
        params.set("inf", searchPassengers.infants.toString());
        applyFlightSearchCabinParams(params, searchCabinClass);
        multiCitySegments.forEach((seg, idx) => {
          params.set(`org${idx}`, seg.origin);
          params.set(`des${idx}`, seg.destination);
          if (seg.departDate)
            params.set(`dDate${idx}`, format(seg.departDate, "yyyy-MM-dd"));
        });
      } else {
        params.set("org", searchOrigin);
        params.set("des", searchDestination);
        if (searchDepartDate)
          params.set("dDate", format(searchDepartDate, "yyyy-MM-dd"));
        if (searchReturnDate && searchTripType === "round-trip")
          params.set("rDate", format(searchReturnDate, "yyyy-MM-dd"));
        params.set("adt", searchPassengers.adults.toString());
        params.set("chd", searchPassengers.children.toString());
        params.set("inf", searchPassengers.infants.toString());
        applyFlightSearchCabinParams(params, searchCabinClass);
        params.set("trip", searchTripType);
      }
    } else if (activeTab === "cars") {
      params.set("org", searchOrigin);
      params.set("des", differentDropoff ? searchDestination : searchOrigin);
      if (searchDepartDate)
        params.set("dDate", format(searchDepartDate, "yyyy-MM-dd"));
      if (searchReturnDate)
        params.set("rDate", format(searchReturnDate, "yyyy-MM-dd"));
      params.set("pTime", pickupTime);
      params.set("dTime", dropoffTime);
    }

    const baseUrl =
      activeTab === "flights"
        ? "/flights/result"
        : activeTab === "hotels"
          ? "/hotels/results"
          : activeTab === "cars"
            ? "/cars/result"
            : activeTab === "packages"
              ? "/packages/result"
              : "/flights/result";

    if (activeTab === "flights") {
      params.set("utm_source", "web");
      params.set("utm_medium", "ezeeflights");
      params.set("utm_campaign", "flight-search");
    }

    params.set("loading", "false");
    if (typeof window !== "undefined") {
      const currentParams = new URLSearchParams(window.location.search);
      const testHost =
        currentParams.get("test_host") || sessionStorage.getItem("test_host");
      if (testHost) {
        params.set("test_host", testHost);
      }
    }
    startLoading(
      t("Searching {{tab}}...", { tab: t(activeTab) }),
      false,
      heroMode,
    );

    // 5. Navigate immediately; insights fetch continues in background
    const finalUrl = `${baseUrl}?${params.toString()}`;
    if (activeTab === "flights" && insightsDestination.length === 3) {
      void prefetchDestinationInsights(insightsDestination);
    }

    if (onSubmit) {
      onSubmit(params);
      return;
    }

    router.push(finalUrl as any);
  };

  const cardClass = heroMode
    ? "bg-[#0e0e0e]/60 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-hero p-2 sm:p-3"
    : "bg-card border border-border rounded-2xl shadow-md p-3";

  const activeTabClass = heroMode
    ? "data-[state=active]:bg-white data-[state=active]:text-redmix data-[state=active]:shadow-lg"
    : "data-[state=active]:bg-muted data-[state=active]:text-redmix";

  const shouldAnimate = heroMode && animateIn;
  const staggerMotion = shouldAnimate
    ? {
        variants: containerVariants,
        initial: "hidden" as const,
        animate: "visible" as const,
      }
    : {};
  const fieldMotion = shouldAnimate ? { variants: fieldVariants } : {};
  const buttonMotion = shouldAnimate ? { variants: buttonVariants } : {};
  const tabMotion = shouldAnimate ? { variants: tabVariants } : {};

  return (
    <div
      className={cn("w-full md:mt-0 mt-1 xl:max-w-6xl xl:mx-auto", cardClass)}
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => handleTabChange(v as TabType)}
      >
        {heroMode && (
          <motion.div {...staggerMotion}>
            <TabsList
              className={cn(
                "mb-4 flex h-auto w-full justify-start gap-2 bg-transparent p-0 overflow-x-auto no-scrollbar",
                heroMode ? "text-white" : "text-foreground",
              )}
            >
              {TABS.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} asChild>
                  <motion.button
                    type="button"
                    {...tabMotion}
                    className={cn(
                      "rounded-full px-5 py-2 text-xs sm:text-sm font-semibold shadow-none cursor-pointer transition-all",
                      activeTabClass,
                      heroMode
                        ? "text-white/70 hover:text-white hover:bg-white/5"
                        : "text-muted-foreground",
                    )}
                  >
                    <span className="mr-1.5 hidden xs:inline">{tab.emoji}</span>
                    {mounted ? t(tab.label) : tab.label}
                  </motion.button>
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>
        )}

        <TabsContent value="flights" className="mt-0 space-y-3">
          <motion.div
            {...staggerMotion}
            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2"
          >
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 pb-1">
              {TRIP_TYPES.map((type) => (
                <motion.button
                  key={type}
                  type="button"
                  {...fieldMotion}
                  onClick={() => setTripType(type)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs capitalize transition-all shrink-0",
                    tripType === type
                      ? "bg-redmix text-white shadow-sm"
                      : heroMode
                        ? "bg-white/10 text-white/80 hover:bg-white/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {mounted ? t(type) : type}
                </motion.button>
              ))}
            </div>
            {/* <React.Suspense
              fallback={
                <div
                  className={cn(
                    "inline-flex h-[30px] w-36 animate-pulse rounded-full px-4 py-1.5 shrink-0",
                    heroMode ? "bg-[#0e0e0e]/60" : "bg-muted",
                  )}
                />
              }
            >
              <MemoizedRecentSearches heroMode={heroMode} />
            </React.Suspense> */}
          </motion.div>

          {(tripType as string) === "multi-city" ? (
            <div className="space-y-3">
              {multiCitySegments.map((segment, index) => (
                <motion.div
                  key={index}
                  {...staggerMotion}
                  className={cn(
                    "relative grid grid-cols-1 gap-2 items-center",
                    heroMode
                      ? "sm:grid-cols-[1.5fr_1.5fr_1fr_40px] md:grid-cols-[1.5fr_1.5fr_1.2fr_40px]"
                      : "sm:grid-cols-[1.5fr_1.5fr_1fr_40px]",
                  )}
                >
                  <motion.div
                    {...fieldMotion}
                    animate={
                      invalidFields.includes(`origin-${index}`)
                        ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                        : undefined
                    }
                    className={cn(
                      "rounded-md border h-12 transition-colors",
                      heroMode
                        ? "bg-white/5 border-white/20"
                        : "bg-muted/30 border-border",
                      invalidFields.includes(`origin-${index}`) &&
                        "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                    )}
                  >
                    <LocationInput
                      value={segment.origin}
                      onChange={(val) =>
                        handleSegmentChange(index, "origin", val)
                      }
                      placeholder={t("From Where?")}
                      className="rounded-md h-12"
                      glassPopover={heroMode}
                      openOnHover={false}
                      mode="flights"
                    />
                  </motion.div>

                  <motion.div
                    {...fieldMotion}
                    animate={
                      invalidFields.includes(`destination-${index}`)
                        ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                        : undefined
                    }
                    className={cn(
                      "rounded-md border h-12 transition-colors",
                      heroMode
                        ? "bg-white/5 border-white/20"
                        : "bg-muted/30 border-border",
                      invalidFields.includes(`destination-${index}`) &&
                        "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                    )}
                  >
                    <LocationInput
                      value={segment.destination}
                      onChange={(val) =>
                        handleSegmentChange(index, "destination", val)
                      }
                      placeholder={t("To Where?")}
                      className="rounded-md h-12"
                      glassPopover={heroMode}
                      openOnHover={false}
                      mode="flights"
                    />
                  </motion.div>

                  <motion.div
                    {...fieldMotion}
                    animate={
                      invalidFields.includes(`departDate-${index}`)
                        ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                        : undefined
                    }
                    className={cn(
                      "rounded-md border h-12 transition-colors",
                      heroMode
                        ? "bg-white/5 border-white/20"
                        : "bg-muted/30 border-border",
                      invalidFields.includes(`departDate-${index}`) &&
                        "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                    )}
                  >
                    <DatePicker
                      date={segment.departDate}
                      setDate={(d) =>
                        handleSegmentChange(index, "departDate", d)
                      }
                      label={t("Depart")}
                      disablePastDates
                      calendarDisabled={(date: Date) => {
                        const minDate =
                          index === 0
                            ? startOfDay(addDays(new Date(), 2))
                            : multiCitySegments[index - 1].departDate
                              ? startOfDay(
                                  multiCitySegments[index - 1].departDate!,
                                )
                              : startOfDay(addDays(new Date(), 2));
                        return isBefore(startOfDay(date), minDate);
                      }}
                      fromDate={
                        index === 0
                          ? startOfDay(addDays(new Date(), 2))
                          : multiCitySegments[index - 1].departDate
                            ? startOfDay(
                                multiCitySegments[index - 1].departDate!,
                              )
                            : startOfDay(addDays(new Date(), 2))
                      }
                      className="rounded-md h-12"
                      glassPopover={heroMode}
                      openOnHover={false}
                    />
                  </motion.div>

                  {multiCitySegments.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeSegment(index)}
                      className={cn(
                        "h-12 w-10 flex items-center justify-center rounded-md border border-redmix/20 hover:bg-redmix/10 text-redmix font-bold cursor-pointer transition-colors sm:relative",
                        "bg-white/5",
                      )}
                    >
                      ✕
                    </button>
                  ) : (
                    <div className="hidden sm:block w-10" />
                  )}
                </motion.div>
              ))}

              <motion.div
                {...staggerMotion}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2"
              >
                {multiCitySegments.length < 6 && (
                  <button
                    type="button"
                    onClick={addSegment}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-xs font-semibold tracking-wider transition-all cursor-pointer",
                      heroMode
                        ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                        : "bg-muted border-border text-muted-foreground hover:bg-muted/80",
                    )}
                  >
                    {t("+ Add Another Flight")}
                  </button>
                )}

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <motion.div
                    {...fieldMotion}
                    className={cn(
                      "rounded-md border min-h-12 transition-colors flex-1 min-w-[200px] sm:flex-none",
                      heroMode
                        ? "bg-white/5 border-white/20"
                        : "bg-muted/30 border-border",
                    )}
                  >
                    <PassengerSelector
                      passengers={passengers}
                      onChange={setPassengers}
                      cabinClass={cabinClass}
                      onCabinChange={setCabinClass}
                      className="rounded-md h-12"
                      glassPopover={heroMode}
                      openOnHover={false}
                    />
                  </motion.div>

                  <motion.button
                    type="button"
                    {...buttonMotion}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleSearch();
                      onSearch?.();
                    }}
                    className="h-12 px-5 rounded-md cursor-pointer bg-redmix text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:brightness-90 flex-1 sm:flex-none whitespace-nowrap"
                  >
                    {mounted ? t("Search Flights →") : "Search Flights →"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              {...staggerMotion}
              className={cn(
                "relative grid grid-cols-1 gap-2",
                heroMode
                  ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1.7fr)] lg:gap-1.5"
                  : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
              )}
            >
              {/* Location Inputs Wrapper */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-2 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 relative z-20 order-1 md:order-1 lg:order-1">
                {heroMode ? (
                  <motion.div
                    {...fieldMotion}
                    animate={
                      invalidFields.includes("origin")
                        ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                        : undefined
                    }
                    className={cn(
                      "rounded-md border h-12 transition-colors w-full",
                      "bg-white/5 border-white/20 pe-0",
                      invalidFields.includes("origin") &&
                        "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                    )}
                  >
                    <LocationInput
                      value={origin}
                      onChange={(val) => {
                        setOrigin(val);
                        if (val && destination) {
                          const originCode = extractAirportCode(val);
                          const destCode = extractAirportCode(destination);
                          if (originCode && destCode && originCode === destCode) {
                            setDestination("");
                          }
                        }
                      }}
                      placeholder={mounted ? t("From Where?") : "From Where?"}
                      className="rounded-md"
                      glassPopover={true}
                      openOnHover={false}
                      mode="flights"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    {...fieldMotion}
                    animate={
                      invalidFields.includes("origin")
                        ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                        : undefined
                    }
                    className={cn(
                      "rounded-md border h-12 transition-colors w-full relative z-20",
                      "bg-muted/30 border-border",
                      invalidFields.includes("origin") &&
                        "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                    )}
                  >
                    <LocationInput
                      value={origin}
                      onChange={(val) => {
                        setOrigin(val);
                        if (val && destination) {
                          const originCode = extractAirportCode(val);
                          const destCode = extractAirportCode(destination);
                          if (originCode && destCode && originCode === destCode) {
                            setDestination("");
                          }
                        }
                      }}
                      placeholder={mounted ? t("From Where?") : "From Where?"}
                      className="rounded-md"
                      glassPopover={false}
                      openOnHover={false}
                      mode="flights"
                    />
                  </motion.div>
                )}
                <motion.div
                  {...fieldMotion}
                  animate={
                    invalidFields.includes("destination")
                      ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                      : undefined
                  }
                  className={cn(
                    "rounded-md border h-12 transition-colors w-full",
                    heroMode
                      ? "bg-white/5 border-white/20"
                      : "bg-muted/30 border-border",
                    invalidFields.includes("destination") &&
                      "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                  )}
                >
                  <LocationInput
                    value={destination}
                    onChange={(val) => {
                      setDestination(val);
                      if (val && origin) {
                        const destCode = extractAirportCode(val);
                        const originCode = extractAirportCode(origin);
                        if (destCode && originCode && destCode === originCode) {
                          setOrigin("");
                        }
                      }
                    }}
                    placeholder={mounted ? t("To Where?") : "To Where?"}
                    className="rounded-md"
                    glassPopover={heroMode}
                    openOnHover={false}
                    mode="flights"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                {...fieldMotion}
                className="flex w-full min-w-0 gap-2 sm:gap-1 xl:gap-2 col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 order-2 md:order-3 lg:order-2"
              >
                <motion.div
                  animate={
                    invalidFields.includes("departDate")
                      ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                      : undefined
                  }
                  className={cn(
                    "min-w-0 flex-1 rounded-md border h-12 transition-colors",
                    heroMode
                      ? "bg-white/5 border-white/20"
                      : "bg-muted/30 border-border",
                    invalidFields.includes("departDate") &&
                      "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                  )}
                >
                  <DatePicker
                    date={departDate}
                    setDate={handleDepartDateChange}
                    label={mounted ? t("Depart") : "Depart"}
                    disablePastDates
                    calendarDisabled={(date: Date) =>
                      isBefore(
                        startOfDay(date),
                        startOfDay(addDays(new Date(), 2)),
                      )
                    }
                    fromDate={startOfDay(addDays(new Date(), 2))}
                    className="rounded-md h-12"
                    glassPopover={heroMode}
                    openOnHover={false}
                  />
                </motion.div>
                <motion.div
                  animate={
                    invalidFields.includes("returnDate")
                      ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                      : undefined
                  }
                  className={cn(
                    "min-w-0 flex-1 rounded-md border h-12 transition-colors",
                    heroMode
                      ? "bg-white/5 border-white/20"
                      : "bg-muted/30 border-border",
                    invalidFields.includes("returnDate") &&
                      "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                  )}
                >
                  <DatePicker
                    date={returnDate}
                    setDate={handleReturnDateChange}
                    label={mounted ? t("Return") : "Return"}
                    disabled={tripType === "one-way"}
                    calendarDisabled={
                      departDate
                        ? (date: Date) =>
                            isBefore(startOfDay(date), startOfDay(departDate))
                        : (date: Date) =>
                            isBefore(
                              startOfDay(date),
                              startOfDay(addDays(new Date(), 2)),
                            )
                    }
                    fromDate={
                      departDate
                        ? startOfDay(departDate)
                        : startOfDay(addDays(new Date(), 2))
                    }
                    className="rounded-md h-12"
                    glassPopover={heroMode}
                    openOnHover={false}
                    defaultMonth={departDate}
                  />
                </motion.div>
              </motion.div>
              <motion.div
                {...fieldMotion}
                className={cn(
                  "rounded-md border min-h-12 transition-colors col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 order-3 md:order-2 lg:order-3",
                  heroMode
                    ? "bg-white/5 border-white/20"
                    : "bg-muted/30 border-border",
                )}
              >
                <PassengerSelector
                  passengers={passengers}
                  onChange={setPassengers}
                  cabinClass={cabinClass}
                  onCabinChange={setCabinClass}
                  className="rounded-md h-12"
                  glassPopover={heroMode}
                  openOnHover={false}
                />
              </motion.div>
              <motion.div
                {...fieldMotion}
                className="col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 order-4 md:order-4 lg:order-4"
              >
                <motion.button
                  type="button"
                  {...buttonMotion}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleSearch();
                    onSearch?.();
                  }}
                  className="h-12 w-full rounded-md cursor-pointer bg-redmix text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:brightness-90"
                >
                  {mounted ? t("Search Flights →") : "Search Flights →"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="hotels" className="mt-0">
          <motion.div
            {...staggerMotion}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2"
          >
            <motion.div
              {...fieldMotion}
              animate={
                invalidFields.includes("destination")
                  ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                  : undefined
              }
              className={cn(
                "rounded-md border h-12 transition-colors",
                heroMode
                  ? "bg-white/5 border-white/20"
                  : "bg-muted/30 border-border",
                invalidFields.includes("destination") &&
                  "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
              )}
            >
              <LocationInput
                value={destination}
                onChange={setDestination}
                placeholder={mounted ? t("City") : "City"}
                className="rounded-md"
                glassPopover={heroMode}
                openOnHover={false}
                mode="hotels"
              />
            </motion.div>
            <motion.div
              {...fieldMotion}
              animate={
                invalidFields.includes("departDate")
                  ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                  : undefined
              }
              className={cn(
                "rounded-md border h-12 transition-colors",
                heroMode
                  ? "bg-white/5 border-white/20"
                  : "bg-muted/30 border-border",
                invalidFields.includes("departDate") &&
                  "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
              )}
            >
              <DatePicker
                date={departDate}
                setDate={handleHotelCheckInChange}
                label={mounted ? t("Check-in") : "Check-in"}
                disablePastDates
                fromDate={startOfDay(new Date())}
                className="rounded-md h-12"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </motion.div>
            <motion.div
              {...fieldMotion}
              animate={
                invalidFields.includes("returnDate")
                  ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                  : undefined
              }
              className={cn(
                "rounded-md border h-12 transition-colors",
                heroMode
                  ? "bg-white/5 border-white/20"
                  : "bg-muted/30 border-border",
                invalidFields.includes("returnDate") &&
                  "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
              )}
            >
              <DatePicker
                date={returnDate}
                setDate={handleHotelCheckOutChange}
                label={mounted ? t("Check-out") : "Check-out"}
                calendarDisabled={
                  departDate
                    ? (date: Date) => isOnOrBeforeCheckOut(date, departDate)
                    : (date: Date) =>
                        isBefore(startOfDay(date), startOfDay(new Date()))
                }
                fromDate={
                  departDate
                    ? minHotelCheckOutDate(departDate)
                    : startOfDay(addDays(new Date(), 1))
                }
                className="rounded-md h-12"
                glassPopover={heroMode}
                openOnHover={false}
                defaultMonth={departDate}
              />
            </motion.div>
            <motion.div
              {...fieldMotion}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 h-12 transition-colors",
                heroMode
                  ? "bg-white/5 border-white/20"
                  : "bg-muted/30 border-border",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  heroMode ? "text-white" : "text-foreground",
                )}
              >
                {t("Guests")}
              </span>
              <CounterInput
                value={guests}
                onChange={setGuests}
                min={1}
                max={10}
                glass={heroMode}
              />
            </motion.div>
            <motion.div
              {...fieldMotion}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 h-12 transition-colors",
                heroMode
                  ? "bg-white/5 border-white/20"
                  : "bg-muted/30 border-border",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  heroMode ? "text-white" : "text-foreground",
                )}
              >
                {t("Rooms")}
              </span>
              <CounterInput
                value={rooms}
                onChange={setRooms}
                min={1}
                max={6}
                glass={heroMode}
              />
            </motion.div>
            <motion.button
              type="button"
              {...buttonMotion}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                handleSearch();
                onSearch?.();
              }}
              className="h-12 w-full rounded-md cursor-pointer bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
            >
              {mounted ? t("Search Hotels →") : "Search Hotels →"}
            </motion.button>
          </motion.div>
        </TabsContent>

        <TabsContent value="cars" className="mt-0 flex flex-col gap-2">
          {/* Row 1: Checkbox */}
          {/* <div className="flex items-center space-x-2 px-1 mb-1">
            <Checkbox
              id="different-dropoff"
              checked={differentDropoff}
              onCheckedChange={(c) => setDifferentDropoff(c as boolean)}
            />
            <label
              htmlFor="different-dropoff"
              className={cn(
                "text-sm cursor-pointer select-none",
                heroMode ? "text-white" : "text-foreground",
              )}
            >
              {t("Return to a different location")}
            </label>
          </div> */}

          <motion.div
            {...staggerMotion}
            className="grid grid-cols-1 lg:grid-cols-12 gap-2"
          >
            {/* Locations */}
            <motion.div
              {...staggerMotion}
              className={cn(
                "grid gap-2",
                differentDropoff
                  ? "col-span-12 lg:col-span-4 grid-cols-1 sm:grid-cols-2"
                  : "col-span-12 lg:col-span-3",
              )}
            >
              <motion.div
                {...fieldMotion}
                animate={
                  invalidFields.includes("origin")
                    ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                    : undefined
                }
                className={cn(
                  "rounded-md border h-12 transition-colors",
                  heroMode
                    ? "bg-white/5 border-white/20"
                    : "bg-muted/30 border-border",
                  invalidFields.includes("origin") &&
                    "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                )}
              >
                <LocationInput
                  value={origin}
                  onChange={setOrigin}
                  placeholder={
                    mounted ? t("Pickup location") : "Pickup location"
                  }
                  className="rounded-md"
                  glassPopover={heroMode}
                  openOnHover={false}
                  mode="cars"
                />
              </motion.div>

              {differentDropoff && (
                <motion.div
                  {...fieldMotion}
                  animate={
                    invalidFields.includes("destination")
                      ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                      : undefined
                  }
                  className={cn(
                    "rounded-md border h-12 transition-colors",
                    heroMode
                      ? "bg-white/5 border-white/20"
                      : "bg-muted/30 border-border",
                    invalidFields.includes("destination") &&
                      "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                  )}
                >
                  <LocationInput
                    value={destination}
                    onChange={setDestination}
                    placeholder={
                      mounted ? t("Dropoff location") : "Dropoff location"
                    }
                    className="rounded-md"
                    glassPopover={heroMode}
                    openOnHover={false}
                    mode="cars"
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Dates & Times */}
            <motion.div
              {...staggerMotion}
              className={cn(
                "grid gap-2 grid-cols-2 sm:grid-cols-4",
                differentDropoff
                  ? "col-span-12 lg:col-span-5"
                  : "col-span-12 lg:col-span-6",
              )}
            >
              <motion.div
                {...fieldMotion}
                animate={
                  invalidFields.includes("departDate")
                    ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                    : undefined
                }
                className={cn(
                  "rounded-md border h-12 transition-colors",
                  heroMode
                    ? "bg-white/5 border-white/20"
                    : "bg-muted/30 border-border",
                  invalidFields.includes("departDate") &&
                    "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                )}
              >
                <DatePicker
                  date={departDate}
                  setDate={handleDepartDateChange}
                  label={mounted ? t("Pickup date") : "Pickup date"}
                  disablePastDates
                  className="rounded-md h-12"
                  glassPopover={heroMode}
                  openOnHover={false}
                />
              </motion.div>

              <motion.div
                {...fieldMotion}
                className={cn(
                  "rounded-md border h-12 transition-colors",
                  heroMode
                    ? "bg-white/5 border-white/20"
                    : "bg-muted/30 border-border",
                )}
              >
                <TimePicker
                  value={pickupTime}
                  onChange={setPickupTime}
                  heroMode={heroMode}
                  label={mounted ? t("Pickup time") : "Pickup time"}
                  openOnHover={false}
                  glassPopover={heroMode}
                />
              </motion.div>

              <motion.div
                {...fieldMotion}
                animate={
                  invalidFields.includes("returnDate")
                    ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                    : undefined
                }
                className={cn(
                  "rounded-md border h-12 transition-colors",
                  heroMode
                    ? "bg-white/5 border-white/20"
                    : "bg-muted/30 border-border",
                  invalidFields.includes("returnDate") &&
                    "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
                )}
              >
                <DatePicker
                  date={returnDate}
                  setDate={handleReturnDateChange}
                  label={mounted ? t("Dropoff date") : "Dropoff date"}
                  calendarDisabled={
                    departDate
                      ? (date: Date) =>
                          isBefore(startOfDay(date), startOfDay(departDate))
                      : undefined
                  }
                  fromDate={
                    departDate ? startOfDay(departDate) : startOfDay(new Date())
                  }
                  className="rounded-md h-12"
                  glassPopover={heroMode}
                  openOnHover={false}
                  defaultMonth={departDate}
                />
              </motion.div>

              <motion.div
                {...fieldMotion}
                className={cn(
                  "rounded-md border h-12 transition-colors",
                  heroMode
                    ? "bg-white/5 border-white/20"
                    : "bg-muted/30 border-border",
                )}
              >
                <TimePicker
                  value={dropoffTime}
                  onChange={setDropoffTime}
                  heroMode={heroMode}
                  label={mounted ? t("Dropoff time") : "Dropoff time"}
                  openOnHover={false}
                  glassPopover={heroMode}
                />
              </motion.div>
            </motion.div>

            {/* Search */}
            <motion.div {...fieldMotion} className="col-span-12 lg:col-span-3">
              <motion.button
                type="button"
                {...buttonMotion}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  handleSearch();
                  onSearch?.();
                }}
                className="h-12 w-full rounded-md cursor-pointer bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
              >
                {mounted ? t("Search Cars →") : "Search Cars →"}
              </motion.button>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent
          value="packages"
          className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          <motion.div
            animate={
              invalidFields.includes("destination")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : {}
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("destination") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <LocationInput
              value={destination}
              onChange={setDestination}
              placeholder={t("Destination")}
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
              mode="hotels"
            />
          </motion.div>
          <motion.div
            {...fieldMotion}
            animate={
              invalidFields.includes("departDate")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : undefined
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("departDate") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <DatePicker
              date={departDate}
              setDate={handleDepartDateChange}
              label={t("Start date")}
              disablePastDates
              className="rounded-md h-12"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            {...fieldMotion}
            animate={
              invalidFields.includes("returnDate")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : undefined
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("returnDate") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <DatePicker
              date={returnDate}
              setDate={handleReturnDateChange}
              label={t("End date")}
              calendarDisabled={
                departDate
                  ? (date: Date) =>
                      isBefore(startOfDay(date), startOfDay(departDate))
                  : undefined
              }
              fromDate={
                departDate ? startOfDay(departDate) : startOfDay(new Date())
              }
              className="rounded-md h-12"
              glassPopover={heroMode}
              openOnHover={false}
              defaultMonth={departDate}
            />
          </motion.div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
            )}
          >
            <span
              className={cn(
                "text-sm",
                heroMode ? "text-white" : "text-foreground",
              )}
            >
              {t("Travelers")}
            </span>
            <CounterInput
              value={guests}
              onChange={setGuests}
              min={1}
              max={12}
              glass={heroMode}
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              handleSearch();
              onSearch?.();
            }}
            className="h-12 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
          >
            {mounted ? t("Search Packages →") : "Search Packages →"}
          </motion.button>
        </TabsContent>

        <TabsContent
          value="transfers"
          className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2"
        >
          <motion.div
            animate={
              invalidFields.includes("origin")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : {}
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("origin") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <LocationInput
              value={origin}
              onChange={setOrigin}
              placeholder={t("From")}
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("destination")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : {}
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("destination") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <LocationInput
              value={destination}
              onChange={setDestination}
              placeholder={t("To")}
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            {...fieldMotion}
            animate={
              invalidFields.includes("departDate")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : undefined
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("departDate") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <DatePicker
              date={departDate}
              setDate={handleDepartDateChange}
              label={t("Date")}
              disablePastDates
              className="rounded-md h-12"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("transferTime")
                ? { x: [-4, 4, -4, 4, 0], opacity: 1, y: 0 }
                : {}
            }
            className={cn(
              "rounded-md border h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
              invalidFields.includes("transferTime") &&
                "border-redmix shadow-[0_0_10px_rgba(235,53,53,0.3)]",
            )}
          >
            <TimePicker
              value={transferTime}
              onChange={setTransferTime}
              heroMode={heroMode}
              label={t("Time")}
              openOnHover={false}
              glassPopover={heroMode}
            />
          </motion.div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-12 transition-colors",
              heroMode
                ? "bg-white/5 border-white/20"
                : "bg-muted/30 border-border",
            )}
          >
            <span
              className={cn(
                "text-sm",
                heroMode ? "text-white" : "text-foreground",
              )}
            >
              {t("Passengers")}
            </span>
            <CounterInput
              value={guests}
              onChange={setGuests}
              min={1}
              max={8}
              glass={heroMode}
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              handleSearch();
              onSearch?.();
            }}
            className="h-12 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
          >
            {mounted ? t("Search Transfers →") : "Search Transfers →"}
          </motion.button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
