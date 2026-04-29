"use client";

import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import {
  useSaveRecentSearch,
  useSaveGuestSearch,
  useRecentSearches,
  useGuestRecentSearches,
} from "@/lib/api/search";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/hooks/use-toast";

const TABS = [
  { id: "flights", label: "Flights", emoji: "✈" },
  { id: "hotels", label: "Hotels", emoji: "🏨" },
  { id: "cars", label: "Cars", emoji: "🚗" },
  { id: "packages", label: "Packages", emoji: "📦" },
  { id: "transfers", label: "Transfers", emoji: "🚌" },
] as const;

const TRIP_TYPES = ["one-way", "round-trip", "multi-city"] as const;

type TabType = (typeof TABS)[number]["id"];

export function BookingForm({
  defaultTab = "flights",
  heroMode = true,
}: {
  defaultTab?: TabType;
  heroMode?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useAuthSession();
  const saveSearchMutation = useSaveRecentSearch();
  const saveGuestSearchMutation = useSaveGuestSearch();
  const { prefill, clearPrefill } = useRecentSearchStore();
  const { toast } = useToast();

  const [invalidFields, setInvalidFields] = React.useState<string[]>([]);

  // URL-persistent tab state
  const activeTab = (searchParams.get("tab") as TabType) || defaultTab;

  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}` as any, { scroll: false });
  };

  const { data: dbSearches = [] } = useRecentSearches(1, Boolean(session.data));
  const { data: guestSearches = [] } = useGuestRecentSearches();

  // Initial values from URL if present
  const [origin, setOrigin] = React.useState(searchParams.get("org") || "");
  const [destination, setDestination] = React.useState(
    searchParams.get("des") || "",
  );

  // Parse dates from URL or default to undefined
  const urlDDate = searchParams.get("dDate");
  const urlRDate = searchParams.get("rDate");
  const [departDate, setDepartDate] = React.useState<Date | undefined>(
    urlDDate ? parseISO(urlDDate) : undefined,
  );
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(
    urlRDate ? parseISO(urlRDate) : undefined,
  );

  const [transferTime, setTransferTime] = React.useState("12:00");
  const [tripType, setTripType] = React.useState<(typeof TRIP_TYPES)[number]>(
    (searchParams.get("trip") as any) || "round-trip",
  );
  const [cabinClass, setCabinClass] = React.useState(
    searchParams.get("class") || "Economy",
  );

  const [passengers, setPassengers] = React.useState({
    adults: parseInt(searchParams.get("adt") || "2"),
    children: parseInt(searchParams.get("chd") || "0"),
    infants: parseInt(searchParams.get("inf") || "0"),
  });

  const [rooms, setRooms] = React.useState(1);
  const [guests, setGuests] = React.useState(2);
  const [driverAge, setDriverAge] = React.useState(30);
  const [swapRotate, setSwapRotate] = React.useState(0);

  // Prefill effect for manual clicks on Recent Search cards
  React.useEffect(() => {
    if (prefill) {
      applySearchToForm(prefill);
      clearPrefill();
    }
  }, [prefill, clearPrefill]);

  // Optional: Auto-prefill from history ONLY on homepage if form is still empty after mount
  React.useEffect(() => {
    const hasParams =
      searchParams.get("org") ||
      searchParams.get("des") ||
      searchParams.get("tab"); // If tab is already in URL, don't auto-switch
    if (hasParams) return;

    // Only auto-fill from history if the user hasn't touched the form yet
    if (!origin && !destination) {
      const lastSearch = session.data ? dbSearches[0] : guestSearches[0];
      if (lastSearch) {
        // Only apply if it's the home page, otherwise history might override the page's intent
        if (pathname === "/" || pathname === "/flights") {
          applySearchToForm(lastSearch);
        }
      }
    }
  }, [dbSearches, guestSearches, session.data, searchParams, pathname]);

  const applySearchToForm = (search: any) => {
    if (search.searchType && search.searchType !== activeTab) {
      handleTabChange(search.searchType as TabType);
    }
    setOrigin(search.origin);
    setDestination(search.destination);
    if (search.searchDate) {
      setDepartDate(parseISO(search.searchDate));
    }
    if (search.metadata) {
      if (search.metadata.tripType) setTripType(search.metadata.tripType);
      if (search.metadata.cabinClass) setCabinClass(search.metadata.cabinClass);
      if (search.metadata.passengers) setPassengers(search.metadata.passengers);
    }
  };

  const handleDepartDateChange = (nextDepartDate: Date | undefined) => {
    setDepartDate(nextDepartDate);

    if (!nextDepartDate) return;

    setReturnDate((prevReturnDate) => {
      if (!prevReturnDate) return prevReturnDate;
      return isBefore(startOfDay(prevReturnDate), startOfDay(nextDepartDate))
        ? nextDepartDate
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

  const handleSearch = () => {
    const missing: string[] = [];

    if (activeTab === "flights") {
      if (!origin) missing.push("origin");
      if (!destination) missing.push("destination");
      if (!departDate) missing.push("departDate");
      if (tripType === "round-trip" && !returnDate) missing.push("returnDate");
    } else if (activeTab === "hotels") {
      if (!destination) missing.push("destination");
      if (!departDate) missing.push("departDate");
      if (!returnDate) missing.push("returnDate");
    } else if (activeTab === "cars") {
      if (!origin) missing.push("origin");
      if (!departDate) missing.push("departDate");
      if (!returnDate) missing.push("returnDate");
    } else if (activeTab === "packages") {
      if (!destination) missing.push("destination");
      if (!departDate) missing.push("departDate");
      if (!returnDate) missing.push("returnDate");
    } else if (activeTab === "transfers") {
      if (!origin) missing.push("origin");
      if (!destination) missing.push("destination");
      if (!departDate) missing.push("departDate");
      if (!transferTime) missing.push("transferTime");
    }

    if (missing.length > 0) {
      setInvalidFields(missing);
      toast({
        title: "Incomplete Search",
        description: `Please fill in all required fields: ${missing.join(", ").replace(/Date/g, " Date")}`,
        variant: "destructive",
      });
      // Clear highlight after 2 seconds
      setTimeout(() => setInvalidFields([]), 2000);
      return;
    }

    // Save to recent searches
    if (origin && destination) {
      const searchData = {
        origin,
        destination,
        searchType: activeTab,
        searchDate: departDate ? format(departDate, "yyyy-MM-dd") : undefined,
        metadata: {
          tripType,
          cabinClass,
          passengers,
        },
      };

      if (session.data) {
        saveSearchMutation.mutate(searchData);
      } else {
        saveGuestSearchMutation.mutate(searchData);
      }
    }

    const params = new URLSearchParams();

    if (activeTab === "hotels") {
      params.set("city", destination);
      if (departDate)
        params.set("checkInDate", format(departDate, "yyyy-MM-dd"));
      if (returnDate)
        params.set("checkOutDate", format(returnDate, "yyyy-MM-dd"));
      params.set("page", "1");
      params.set("limit", "12");
    } else {
      params.set("org", origin);
      params.set("des", destination);
      if (departDate) params.set("dDate", format(departDate, "yyyy-MM-dd"));
      if (returnDate) params.set("rDate", format(returnDate, "yyyy-MM-dd"));
      params.set("adt", passengers.adults.toString());
      params.set("chd", passengers.children.toString());
      params.set("inf", passengers.infants.toString());
      params.set("class", cabinClass);
      params.set("trip", tripType);
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

    router.push(`${baseUrl}?${params.toString()}`);
  };

  const cardClass = heroMode
    ? "bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-hero p-2 sm:p-3"
    : "bg-card border border-border rounded-2xl shadow-md p-3";

  const activeTabClass = heroMode
    ? "data-[state=active]:bg-white data-[state=active]:text-redmix data-[state=active]:shadow-lg"
    : "data-[state=active]:bg-muted data-[state=active]:text-redmix";

  return (
    <div className={cn("w-full", cardClass)}>
      <Tabs
        value={activeTab}
        onValueChange={(v) => handleTabChange(v as TabType)}
      >
        {heroMode && (
          <TabsList
            className={cn(
              "mb-4 flex h-auto w-full justify-start gap-2 bg-transparent p-0 overflow-x-auto no-scrollbar",
              heroMode ? "text-white" : "text-foreground",
            )}
          >
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-full px-5 py-2 text-xs sm:text-sm font-semibold shadow-none cursor-pointer transition-all",
                  activeTabClass,
                  heroMode
                    ? "text-white/70 hover:text-white hover:bg-white/5"
                    : "text-muted-foreground",
                )}
              >
                <span className="mr-1.5 hidden xs:inline">{tab.emoji}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <TabsContent value="flights" className="mt-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs capitalize transition-all",
                  tripType === type
                    ? "bg-redmix text-white shadow-sm"
                    : heroMode
                      ? "bg-white/10 text-white/80 hover:bg-white/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {type.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.8fr)_minmax(0,1.9fr)]">
            <motion.div
              animate={
                invalidFields.includes("origin") ? { x: [-4, 4, -4, 4, 0] } : {}
              }
              className={cn(
                "rounded-md border h-14 transition-colors sm:col-span-1 lg:col-span-1",
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
                placeholder="From Where?"
                className="rounded-md"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </motion.div>
            <motion.button
              type="button"
              whileTap={{ rotate: 180 }}
              animate={{ rotate: swapRotate }}
              onClick={() => {
                setSwapRotate((v) => v + 180);
                setOrigin(destination);
                setDestination(origin);
              }}
              className={cn(
                "h-14 rounded-md border flex items-center justify-center transition-all sm:z-10",
                heroMode 
                  ? "border-white/25 text-white sm:bg-white/10 sm:backdrop-blur-md sm:border-white/30" 
                  : "border-border sm:bg-background",
                "sm:absolute sm:left-1/2 sm:top-7 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-10 sm:w-10 sm:rounded-full sm:shadow-lg lg:relative lg:left-0 lg:top-0 lg:translate-x-0 lg:translate-y-0 lg:h-14 lg:w-full lg:rounded-md lg:bg-transparent lg:shadow-none lg:border-none",
              )}
            >
              <ArrowRightLeft className="h-4 w-4 sm:rotate-0 -rotate-90 lg:rotate-0" />
            </motion.button>
            <motion.div
              animate={
                invalidFields.includes("destination")
                  ? { x: [-4, 4, -4, 4, 0] }
                  : {}
              }
              className={cn(
                "rounded-md border h-14 transition-colors sm:col-span-1 lg:col-span-1",
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
                placeholder="Where To?"
                className="rounded-md"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </motion.div>
            <motion.div
              animate={
                invalidFields.includes("departDate")
                  ? { x: [-4, 4, -4, 4, 0] }
                  : {}
              }
              className={cn(
                "rounded-md border h-14 transition-colors sm:col-span-1 lg:col-span-1",
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
                label="Depart"
                disablePastDates
                className="rounded-md h-14"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </motion.div>
            <motion.div
              animate={
                invalidFields.includes("returnDate")
                  ? { x: [-4, 4, -4, 4, 0] }
                  : {}
              }
              className={cn(
                "rounded-md border h-14 transition-colors sm:col-span-1 lg:col-span-1",
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
                label="Return"
                disabled={tripType === "one-way"}
                calendarDisabled={
                  departDate
                    ? (date: Date) =>
                        isBefore(startOfDay(date), startOfDay(departDate))
                    : undefined
                }
                className="rounded-md h-14"
                glassPopover={heroMode}
                openOnHover={false}
                defaultMonth={departDate}
              />
            </motion.div>
            <div
              className={cn(
                "rounded-md border min-h-14 transition-colors sm:col-span-1 lg:col-span-1",
                heroMode
                  ? "bg-white/5 border-white/20"
                  : "bg-muted/30 border-border",
              )}
            >
              <PassengerSelector
                passengers={passengers}
                onChange={(k, v) => setPassengers((p) => ({ ...p, [k]: v }))}
                cabinClass={cabinClass}
                onCabinChange={setCabinClass}
                className="rounded-md h-14"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </div>
            <div className="sm:col-span-1 lg:col-span-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="h-14 w-full rounded-xl bg-redmix text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:brightness-90"
              >
                Search Flights →
              </motion.button>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="hotels"
          className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2"
        >
          <motion.div
            animate={
              invalidFields.includes("destination")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              placeholder="City"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("departDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Check-in"
              disablePastDates
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("returnDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Check-out"
              calendarDisabled={
                departDate
                  ? (date: Date) =>
                      isBefore(startOfDay(date), startOfDay(departDate))
                  : undefined
              }
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
              defaultMonth={departDate}
            />
          </motion.div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-14 transition-colors",
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
              Guests
            </span>
            <CounterInput
              value={guests}
              onChange={setGuests}
              min={1}
              max={10}
              glass={heroMode}
            />
          </div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-14 transition-colors",
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
              Rooms
            </span>
            <CounterInput
              value={rooms}
              onChange={setRooms}
              min={1}
              max={6}
              glass={heroMode}
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={handleSearch}
            className="h-14 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
          >
            Search Hotels →
          </motion.button>
        </TabsContent>

        <TabsContent
          value="cars"
          className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          <motion.div
            animate={
              invalidFields.includes("origin") ? { x: [-4, 4, -4, 4, 0] } : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              placeholder="Pickup location"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("departDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Pickup date"
              disablePastDates
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("returnDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Dropoff date"
              calendarDisabled={
                departDate
                  ? (date: Date) =>
                      isBefore(startOfDay(date), startOfDay(departDate))
                  : undefined
              }
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
              defaultMonth={departDate}
            />
          </motion.div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-14 transition-colors",
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
              Driver age
            </span>
            <CounterInput
              value={driverAge}
              onChange={setDriverAge}
              min={18}
              max={75}
              glass={heroMode}
            />
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={handleSearch}
            className="h-14 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
          >
            Search Cars →
          </motion.button>
        </TabsContent>

        <TabsContent
          value="packages"
          className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          <motion.div
            animate={
              invalidFields.includes("destination")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              placeholder="Destination"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("departDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Start date"
              disablePastDates
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("returnDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="End date"
              calendarDisabled={
                departDate
                  ? (date: Date) =>
                      isBefore(startOfDay(date), startOfDay(departDate))
                  : undefined
              }
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
              defaultMonth={departDate}
            />
          </motion.div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-14 transition-colors",
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
              Travelers
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
            onClick={handleSearch}
            className="h-14 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
          >
            Search Packages →
          </motion.button>
        </TabsContent>

        <TabsContent
          value="transfers"
          className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2"
        >
          <motion.div
            animate={
              invalidFields.includes("origin") ? { x: [-4, 4, -4, 4, 0] } : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              placeholder="From"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("destination")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              placeholder="To"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("departDate")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Date"
              disablePastDates
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </motion.div>
          <motion.div
            animate={
              invalidFields.includes("transferTime")
                ? { x: [-4, 4, -4, 4, 0] }
                : {}
            }
            className={cn(
              "rounded-md border h-14 transition-colors",
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
              label="Time"
              openOnHover={false}
              glassPopover={heroMode}
            />
          </motion.div>
          <div
            className={cn(
              "flex items-center justify-between rounded-md border px-3 h-14 transition-colors",
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
              Passengers
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
            onClick={handleSearch}
            className="h-14 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
          >
            Search Transfers →
          </motion.button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
