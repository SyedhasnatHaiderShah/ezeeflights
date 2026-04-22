"use client";

import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
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

const TABS = [
  { id: "flights", label: "✈ Flights" },
  { id: "hotels", label: "🏨 Hotels" },
  { id: "cars", label: "🚗 Cars" },
  { id: "packages", label: "📦 Packages" },
  { id: "transfers", label: "🚌 Transfers" },
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
  
  // URL-persistent tab state
  const activeTab = (searchParams.get("tab") as TabType) || defaultTab;
  
  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}` as any, { scroll: false });
  };

  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [departDate, setDepartDate] = React.useState<Date | undefined>();
  const [returnDate, setReturnDate] = React.useState<Date | undefined>();
  const [transferTime, setTransferTime] = React.useState("12:00");
  const [tripType, setTripType] =
    React.useState<(typeof TRIP_TYPES)[number]>("round-trip");
  const [cabinClass, setCabinClass] = React.useState("Economy");
  const [passengers, setPassengers] = React.useState({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [rooms, setRooms] = React.useState(1);
  const [guests, setGuests] = React.useState(2);
  const [driverAge, setDriverAge] = React.useState(30);
  const [swapRotate, setSwapRotate] = React.useState(0);

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
    const params = new URLSearchParams();
    params.set("org", origin);
    params.set("des", destination);
    if (departDate) params.set("dDate", format(departDate, "yyyy-MM-dd"));
    if (returnDate) params.set("rDate", format(returnDate, "yyyy-MM-dd"));
    params.set("adt", passengers.adults.toString());
    params.set("chd", passengers.children.toString());
    params.set("inf", passengers.infants.toString());
    params.set("class", cabinClass);
    params.set("trip", tripType);
    router.push(`/flights/result?${params.toString()}`);
  };

  const cardClass = heroMode
    ? "bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-hero p-2 sm:p-3"
    : "bg-card border border-border rounded-3xl shadow-md p-3";

  const activeTabClass = heroMode
    ? "data-[state=active]:bg-white data-[state=active]:text-brand-red"
    : "data-[state=active]:bg-muted data-[state=active]:text-brand-red";

  return (
    <div className={cn("w-full", cardClass)}>
      <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabType)}>
        <TabsList
          className={cn(
            "mb-4 h-auto w-full justify-start gap-2 bg-transparent p-0",
            heroMode ? "text-white" : "text-muted-foreground",
          )}
        >
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-md px-3 py-2 text-xs sm:text-sm font-semibold shadow-none",
                activeTabClass,
                heroMode
                  ? "text-white/70 hover:text-white"
                  : "text-muted-foreground",
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="flights" className="mt-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {TRIP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs capitalize",
                  tripType === type
                    ? "bg-brand-red text-white"
                    : heroMode
                      ? "bg-white/10 text-white/80"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {type.replace("-", " ")}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.8fr)_minmax(0,1.9fr)]">
            <div className="rounded-md border border-white/20 bg-white/5 h-14">
              <LocationInput
                value={origin}
                onChange={setOrigin}
                placeholder="From where?"
                className="rounded-md"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </div>
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
                "h-14 rounded-md border flex items-center justify-center",
                heroMode ? "border-white/25 text-white" : "border-border",
              )}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </motion.button>
            <div className="rounded-md border border-white/20 bg-white/5 min-h-14">
              <LocationInput
                value={destination}
                onChange={setDestination}
                placeholder="Where to?"
                className="rounded-md"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </div>
            <div className="rounded-md border border-white/20 bg-white/5 min-h-14">
              <DatePicker
                date={departDate}
                setDate={handleDepartDateChange}
                label="Depart"
                className="rounded-md h-14"
                glassPopover={heroMode}
                openOnHover={false}
              />
            </div>
            <div className="rounded-md border border-white/20 bg-white/5 min-h-14">
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
              />
            </div>
            <div className="rounded-md border border-white/20 bg-white/5 min-h-14">
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
            <div>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={handleSearch}
                className="h-14 w-full rounded-md bg-redmix text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-red-light"
              >
                Search Flights →
              </motion.button>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="hotels"
          className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2"
        >
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <LocationInput
              value={destination}
              onChange={setDestination}
              placeholder="City"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={departDate}
              setDate={setDepartDate}
              label="Check-in"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={returnDate}
              setDate={setReturnDate}
              label="Check-out"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/20 px-3 bg-white/5">
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
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/20 px-3 bg-white/5">
            <span
              className={cn(
                "text-sm",
                heroMode ? "text-white" : "text-foreground",
              )}
            >
              Rooms
            </span>
            <CounterInput value={rooms} onChange={setRooms} min={1} max={6} />
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
          className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <LocationInput
              value={origin}
              onChange={setOrigin}
              placeholder="Pickup location"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={departDate}
              setDate={setDepartDate}
              label="Pickup date"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={returnDate}
              setDate={setReturnDate}
              label="Dropoff date"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/20 px-3 bg-white/5">
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
          className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2"
        >
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <LocationInput
              value={destination}
              onChange={setDestination}
              placeholder="Destination"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={departDate}
              setDate={setDepartDate}
              label="Start date"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={returnDate}
              setDate={setReturnDate}
              label="End date"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/20 px-3 bg-white/5">
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
          className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2"
        >
          <div className="rounded-md border border-white/20 bg-white/5 min-h-14">
            <LocationInput
              value={origin}
              onChange={setOrigin}
              placeholder="From"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <LocationInput
              value={destination}
              onChange={setDestination}
              placeholder="To"
              className="rounded-md"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <DatePicker
              date={departDate}
              setDate={setDepartDate}
              label="Date"
              className="rounded-md h-14"
              glassPopover={heroMode}
              openOnHover={false}
            />
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 h-14">
            <TimePicker
              value={transferTime}
              onChange={setTransferTime}
              heroMode={heroMode}
              label="Time"
              openOnHover={false}
              glassPopover={heroMode}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/20 px-3 h-14 bg-white/5">
            <span
              className={cn(
                "text-sm",
                heroMode ? "text-white" : "text-foreground",
              )}
            >
              Passengers
            </span>
            <CounterInput value={guests} onChange={setGuests} min={1} max={8} />
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
