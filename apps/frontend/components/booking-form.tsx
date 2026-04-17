"use client";

import * as React from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRightLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationInput } from "@/components/ui/location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/PassengerSelector";
import { CounterInput } from "@/components/ui/CounterInput";
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

export function BookingForm({ defaultTab = "flights", heroMode = true }: { defaultTab?: TabType; heroMode?: boolean }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<TabType>(defaultTab);
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [departDate, setDepartDate] = React.useState<Date | undefined>();
  const [returnDate, setReturnDate] = React.useState<Date | undefined>();
  const [tripType, setTripType] = React.useState<(typeof TRIP_TYPES)[number]>("round-trip");
  const [cabinClass, setCabinClass] = React.useState("Economy");
  const [passengers, setPassengers] = React.useState({ adults: 2, children: 0, infants: 0 });
  const [rooms, setRooms] = React.useState(1);
  const [guests, setGuests] = React.useState(2);
  const [driverAge, setDriverAge] = React.useState(30);
  const [swapRotate, setSwapRotate] = React.useState(0);

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
    : "bg-card border border-border rounded-3xl shadow-md p-4";

  const activeTabClass = heroMode
    ? "data-[state=active]:bg-white data-[state=active]:text-brand-red"
    : "data-[state=active]:bg-muted data-[state=active]:text-brand-red";

  return (
    <div className={cn("w-full", cardClass)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className={cn("mb-4 h-auto w-full justify-start gap-2 bg-transparent p-0", heroMode ? "text-white" : "text-muted-foreground")}>
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                "rounded-2xl px-3 py-2 text-xs sm:text-sm font-semibold shadow-none",
                activeTabClass,
                heroMode ? "text-white/70 hover:text-white" : "text-muted-foreground",
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
            <div className="lg:col-span-3 rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={origin} onChange={setOrigin} placeholder="From where?" className="rounded-2xl" /></div>
            <motion.button
              type="button"
              whileTap={{ rotate: 180 }}
              animate={{ rotate: swapRotate }}
              onClick={() => {
                setSwapRotate((v) => v + 180);
                setOrigin(destination);
                setDestination(origin);
              }}
              className={cn("lg:col-span-1 h-14 rounded-2xl border flex items-center justify-center", heroMode ? "border-white/25 text-white" : "border-border")}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </motion.button>
            <div className="lg:col-span-3 rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={destination} onChange={setDestination} placeholder="Where to?" className="rounded-2xl" /></div>
            <div className="lg:col-span-2 rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={departDate} setDate={setDepartDate} label="Depart" className="rounded-2xl h-14" /></div>
            <div className="lg:col-span-2 rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={returnDate} setDate={setReturnDate} label="Return" disabled={tripType === "one-way"} className="rounded-2xl h-14" /></div>
            <div className="lg:col-span-4 rounded-2xl border border-white/20 bg-white/5 min-h-14"><PassengerSelector passengers={passengers} onChange={(k, v) => setPassengers((p) => ({ ...p, [k]: v }))} cabinClass={cabinClass} onCabinChange={setCabinClass} className="rounded-2xl h-14" /></div>
            <div className="lg:col-span-3 flex items-center rounded-2xl border border-white/20 px-3 bg-white/5">
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className={cn("h-10 w-full bg-transparent text-sm outline-none", heroMode ? "text-white" : "text-foreground")}
              >
                {"Economy,Premium,Business,First".split(",").map((option) => (
                  <option key={option} value={option} className="text-foreground">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-5">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={handleSearch}
                className="h-14 w-full rounded-2xl bg-brand-red text-white font-semibold shadow-lg animate-pulse-glow"
              >
                Search Flights →
              </motion.button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hotels" className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={destination} onChange={setDestination} placeholder="City" className="rounded-2xl" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={departDate} setDate={setDepartDate} label="Check-in" className="rounded-2xl h-14" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={returnDate} setDate={setReturnDate} label="Check-out" className="rounded-2xl h-14" /></div>
          <div className="flex items-center justify-between rounded-2xl border border-white/20 px-3 bg-white/5"><span className={cn("text-sm", heroMode ? "text-white" : "text-foreground")}>Guests</span><CounterInput value={guests} onChange={setGuests} min={1} max={10} /></div>
          <div className="flex items-center justify-between rounded-2xl border border-white/20 px-3 bg-white/5"><span className={cn("text-sm", heroMode ? "text-white" : "text-foreground")}>Rooms</span><CounterInput value={rooms} onChange={setRooms} min={1} max={6} /></div>
        </TabsContent>

        <TabsContent value="cars" className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={origin} onChange={setOrigin} placeholder="Pickup location" className="rounded-2xl" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={departDate} setDate={setDepartDate} label="Pickup date" className="rounded-2xl h-14" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={returnDate} setDate={setReturnDate} label="Dropoff date" className="rounded-2xl h-14" /></div>
          <div className="flex items-center justify-between rounded-2xl border border-white/20 px-3 bg-white/5"><span className={cn("text-sm", heroMode ? "text-white" : "text-foreground")}>Driver age</span><CounterInput value={driverAge} onChange={setDriverAge} min={18} max={75} /></div>
        </TabsContent>

        <TabsContent value="packages" className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={destination} onChange={setDestination} placeholder="Destination" className="rounded-2xl" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={departDate} setDate={setDepartDate} label="Start date" className="rounded-2xl h-14" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={returnDate} setDate={setReturnDate} label="End date" className="rounded-2xl h-14" /></div>
          <div className="flex items-center justify-between rounded-2xl border border-white/20 px-3 bg-white/5"><span className={cn("text-sm", heroMode ? "text-white" : "text-foreground")}>Travelers</span><CounterInput value={guests} onChange={setGuests} min={1} max={12} /></div>
        </TabsContent>

        <TabsContent value="transfers" className="mt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={origin} onChange={setOrigin} placeholder="From" className="rounded-2xl" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><LocationInput value={destination} onChange={setDestination} placeholder="To" className="rounded-2xl" /></div>
          <div className="rounded-2xl border border-white/20 bg-white/5 min-h-14"><DatePicker date={departDate} setDate={setDepartDate} label="Date" className="rounded-2xl h-14" /></div>
          <input type="time" className={cn("h-14 rounded-2xl border border-white/20 px-3 bg-white/5", heroMode ? "text-white" : "text-foreground")} />
          <div className="flex items-center justify-between rounded-2xl border border-white/20 px-3 bg-white/5"><span className={cn("text-sm", heroMode ? "text-white" : "text-foreground")}>Passengers</span><CounterInput value={guests} onChange={setGuests} min={1} max={8} /></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
