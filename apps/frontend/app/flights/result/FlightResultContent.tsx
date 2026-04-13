"use client";

import React, { useState, useMemo } from "react";
import { Info, ChevronRight, Loader2 } from "lucide-react";
import { FlightCard } from "@/components/flights/FlightCard";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FlightListItem } from "@/lib/types/flight-api";

interface Props {
  initialFlights: FlightListItem[];
  isLoading?: boolean;
  totalFlights?: number;
}

const formatDurationMinutes = (totalMinutes: number) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
};

export function FlightResultContent({
  initialFlights,
  isLoading,
  totalFlights,
}: Props) {
  const [activeTab, setActiveTab] = useState("best");
  const [displayedCount, setDisplayedCount] = useState(10);
  const ITEMS_PER_PAGE = 10;

  const sortedFlights = useMemo(() => {
    const flights = [...initialFlights];
    if (activeTab === "cheapest") {
      return flights.sort((a, b) => a.totalCost - b.totalCost);
    } else if (activeTab === "quickest") {
      return flights.sort((a, b) => a.totalTime - b.totalTime);
    } else {
      // "Best" - combined logic (score = price / 5 + duration in minutes)
      // Lower score is better
      return flights.sort((a, b) => {
        const scoreA = a.totalCost / 5 + a.totalTime;
        const scoreB = b.totalCost / 5 + b.totalTime;
        return scoreA - scoreB;
      });
    }
  }, [activeTab, initialFlights]);

  const cheapestPrice = useMemo(() => {
    if (initialFlights.length === 0) return 0;
    const prices = initialFlights.map((f) => f.totalCost);
    return Math.min(...prices);
  }, [initialFlights]);

  const quickestDuration = useMemo(() => {
    if (initialFlights.length === 0) return "0h 0m";
    const durations = initialFlights.map((f) => f.totalTime);
    const minMins = Math.min(...durations);
    return formatDurationMinutes(minMins);
  }, [initialFlights]);

  const bestPrice = useMemo(() => {
    if (sortedFlights.length > 0 && activeTab === "best") {
      return sortedFlights[0].totalCost;
    }
    return initialFlights[0]?.totalCost || 0;
  }, [sortedFlights, activeTab, initialFlights]);

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const displayedFlights = sortedFlights.slice(0, displayedCount);
  const hasMore = displayedCount < sortedFlights.length;

  // Reset pagination when tab changes
  React.useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [activeTab]);

  if (isLoading) {
    return <FlightResultSkeleton />;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="best" onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-14 bg-white dark:bg-muted/10 p-0 rounded-xl border border-gray-200 dark:border-border overflow-hidden flex divide-x divide-gray-100 dark:divide-border/50 shadow-sm">
          <TabsTrigger
            value="cheapest"
            className="flex-1 h-full p-2 flex flex-col justify-center items-center cursor-pointer data-[state=active]:bg-brand-dark/[0.03] data-[state=active]:border-b-2 data-[state=active]:border-brand-dark data-[state=active]:shadow-none bg-transparent rounded-none transition-all group"
          >
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-tight transition-colors",
                activeTab === "cheapest"
                  ? "text-brand-dark"
                  : "text-brand-dark-light/80 group-hover:text-brand-dark-light/60",
              )}
            >
              Cheapest
            </p>
            <p className="text-sm font-black text-brand-dark mt-0.5">
              ${cheapestPrice.toLocaleString()}
            </p>
          </TabsTrigger>

          <TabsTrigger
            value="best"
            className="flex-1 h-full p-2 flex flex-col justify-center items-center cursor-pointer data-[state=active]:bg-brand-dark/[0.03] data-[state=active]:border-b-2 data-[state=active]:border-brand-dark data-[state=active]:shadow-none bg-transparent rounded-none transition-all group"
          >
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 transition-colors",
                activeTab === "best"
                  ? "text-brand-dark"
                  : "text-brand-dark-light/80 group-hover:text-brand-dark-light/60",
              )}
            >
              Best{" "}
              <Info className="w-3 h-3 text-brand-dark-light/80 dark:text-brand-dark-light/20" />
            </p>
            <p className="text-sm font-black text-brand-dark mt-0.5">
              ${bestPrice.toLocaleString()}
            </p>
          </TabsTrigger>

          <TabsTrigger
            value="quickest"
            className="flex-1 h-full p-2 flex flex-col justify-center items-center cursor-pointer data-[state=active]:bg-brand-dark/[0.03] data-[state=active]:border-b-2 data-[state=active]:border-brand-dark data-[state=active]:shadow-none bg-transparent rounded-none transition-all group"
          >
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-tight transition-colors",
                activeTab === "quickest"
                  ? "text-brand-dark"
                  : "text-brand-dark-light/80 group-hover:text-brand-dark-light/60",
              )}
            >
              Quickest
            </p>
            <p className="text-sm font-black text-brand-dark-light mt-0.5">
              {quickestDuration}
            </p>
          </TabsTrigger>

          <div className="flex-none w-20 flex items-center justify-center p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/20 transition-all border-l border-gray-100 dark:border-border/50 group">
            <span className="text-xs font-bold text-brand-dark-light uppercase tracking-widest flex items-center gap-1 group-hover:text-brand-dark-light/50 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between px-1">
        <div className="text-xs font-semibold text-brand-dark-light">
          <span className="text-brand-dark font-bold">
            {sortedFlights.length}
          </span>{" "}
          {totalFlights ? (
            <>
              of{" "}
              <span className="text-brand-dark font-bold">{totalFlights}</span>
            </>
          ) : null}{" "}
          flights
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-brand-dark-light cursor-pointer hover:text-brand-dark  transition-colors">
          Track prices <Info className="w-3 h-3" />
        </div>
      </div>

      <div className="space-y-4">
        {displayedFlights.map((flight: FlightListItem) => (
          <FlightCard key={flight.flightId} flight={flight} />
        ))}
      </div>

      {hasMore && (
        <div className="pt-6 pb-2 flex justify-center">
          <button
            onClick={handleShowMore}
            className="px-6 py-2.5 bg-white dark:bg-muted/10 hover:bg-gray-50 dark:hover:bg-muted/20 border border-gray-200 dark:border-border rounded-lg text-sm font-bold text-brand-dark transition-all shadow-sm flex items-center gap-2"
          >
            Show More Results
          </button>
        </div>
      )}
    </div>
  );
}
