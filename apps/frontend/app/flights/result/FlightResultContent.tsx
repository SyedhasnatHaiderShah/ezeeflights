"use client";

import React, { useState, useMemo } from "react";
import { Info, ChevronRight } from "lucide-react";
import * as motion from "framer-motion/client";
import { FlightCard } from "@/components/flights/FlightCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Props {
  initialFlights: any[];
}

const parseDuration = (duration: string) => {
  const hours = duration.match(/(\d+)h/)?.[1] || "0";
  const minutes = duration.match(/(\d+)m/)?.[1] || "0";
  return parseInt(hours) * 60 + parseInt(minutes);
};

export function FlightResultContent({ initialFlights }: Props) {
  const [activeTab, setActiveTab] = useState("best");

  const sortedFlights = useMemo(() => {
    const flights = [...initialFlights];
    if (activeTab === "cheapest") {
      return flights.sort((a, b) => (a.baseFare || a.totalFare) - (b.baseFare || b.totalFare));
    } else if (activeTab === "quickest") {
      return flights.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    } else {
      // "Best" - combined logic (score = price / 10 + duration in minutes)
      return flights.sort((a, b) => {
        const scoreA = (a.baseFare || a.totalFare) / 2 + parseDuration(a.duration);
        const scoreB = (b.baseFare || b.totalFare) / 2 + parseDuration(b.duration);
        return scoreA - scoreB;
      });
    }
  }, [activeTab, initialFlights]);

  const cheapestPrice = useMemo(() => {
    const prices = initialFlights.map(f => f.baseFare || f.totalFare);
    return Math.min(...prices);
  }, [initialFlights]);

  const quickestDuration = useMemo(() => {
    const durations = initialFlights.map(f => parseDuration(f.duration));
    const minMins = Math.min(...durations);
    const h = Math.floor(minMins / 60);
    const m = minMins % 60;
    return `${h}h ${m}m`;
  }, [initialFlights]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="best" onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-[72px] bg-white dark:bg-muted/10 p-0 rounded-[4px] border border-gray-200 dark:border-border overflow-hidden flex divide-x divide-gray-100 dark:divide-border/50 shadow-sm">
          <TabsTrigger 
            value="cheapest"
            className="flex-1 h-full p-2 flex flex-col justify-center items-center cursor-pointer data-[state=active]:bg-[#ff4b2b]/[0.02] data-[state=active]:border-b-[4px] data-[state=active]:border-[#ff4b2b] data-[state=active]:shadow-none bg-transparent rounded-none transition-all group"
          >
            <p className={cn(
              "text-[13px] font-bold uppercase tracking-tight transition-colors",
              activeTab === "cheapest" ? "text-foreground" : "text-gray-500 dark:text-muted-foreground group-hover:text-foreground"
            )}>
              Cheapest
            </p>
            <p className="text-sm font-extrabold text-[#ff4b2b] mt-0.5">
              ${cheapestPrice}
            </p>
          </TabsTrigger>

          <TabsTrigger 
            value="best"
            className="flex-1 h-full p-2 flex flex-col justify-center items-center cursor-pointer data-[state=active]:bg-[#ff4b2b]/[0.02] data-[state=active]:border-b-[4px] data-[state=active]:border-[#ff4b2b] data-[state=active]:shadow-none bg-transparent rounded-none transition-all group"
          >
            <p className={cn(
              "text-[13px] font-bold uppercase tracking-tight flex items-center justify-center gap-1.5 transition-colors",
              activeTab === "best" ? "text-foreground" : "text-gray-500 dark:text-muted-foreground group-hover:text-foreground"
            )}>
              Best <Info className="w-3 h-3 text-gray-400" />
            </p>
            <p className="text-sm font-extrabold text-foreground mt-0.5">
              ${initialFlights[0]?.baseFare || 570}
            </p>
          </TabsTrigger>

          <TabsTrigger 
            value="quickest"
            className="flex-1 h-full p-2 flex flex-col justify-center items-center cursor-pointer data-[state=active]:bg-[#ff4b2b]/[0.02] data-[state=active]:border-b-[4px] data-[state=active]:border-[#ff4b2b] data-[state=active]:shadow-none bg-transparent rounded-none transition-all group"
          >
            <p className={cn(
              "text-[13px] font-bold uppercase tracking-tight transition-colors",
              activeTab === "quickest" ? "text-foreground" : "text-gray-500 dark:text-muted-foreground group-hover:text-foreground"
            )}>
              Quickest
            </p>
            <p className="text-sm font-extrabold text-[#ff4b2b] mt-0.5">
              {quickestDuration}
            </p>
          </TabsTrigger>

          <div className="flex-none w-28 flex items-center justify-center p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/20 transition-all border-l border-gray-100 dark:border-border/50 group">
             <span className="text-xs font-extrabold text-gray-600 dark:text-muted-foreground uppercase tracking-tight flex items-center gap-1">
               Other <ChevronRight className="w-3.5 h-3.5" />
             </span>
          </div>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-bold text-gray-500 dark:text-muted-foreground">
          <span className="text-foreground">{sortedFlights.length}</span> of{" "}
          <span className="text-foreground">349</span> flights
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#ff4b2b] cursor-pointer hover:underline uppercase tracking-tighter">
          Track prices <Info className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="space-y-4"
      >
        {sortedFlights.map((flight: any) => (
          <FlightCard key={flight.id} {...flight} />
        ))}
      </motion.div>
    </div>
  );
}
