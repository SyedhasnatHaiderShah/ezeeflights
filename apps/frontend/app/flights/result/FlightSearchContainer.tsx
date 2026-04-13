"use client";

import React, { useMemo } from "react";
import * as motion from "framer-motion/client";
import { Suspense } from "react";
import { FlightResultContent } from "./FlightResultContent";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { SmartFilters } from "./SmartFilters";
import { QuickFilters } from "./QuickFilters";
import { TimeFilter } from "./TimeFilter";
import { AirlinesFilter } from "./AirlinesFilter";
import { LocationFilters } from "./LocationFilters";
import { DurationFilter } from "./DurationFilter";
import { AccordionFilters } from "./AccordionFilters";
import { FlightFilters } from "./FlightFilters";
import { FlightListItem } from "@/lib/types/flight-api";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { filterFlights } from "@/lib/utils/filter-flights";

interface Props {
  initialFlights: FlightListItem[];
  isLoading?: boolean;
}

export function FlightSearchContainer({ initialFlights, isLoading }: Props) {
  const { filters, setFilter } = useFlightFilterStore();

  // Initialize price range based on data
  React.useEffect(() => {
    if (initialFlights.length > 0) {
      const prices = initialFlights.map((f) => f.totalCost);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setFilter("priceRange", [minPrice, maxPrice]);
    }
  }, [initialFlights, setFilter]);

  const filteredFlights = useMemo(() => {
    return filterFlights(initialFlights, filters);
  }, [initialFlights, filters]);

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-5">
      {/* Left Sidebar: Smart & Standard Filters */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-64 flex-shrink-0 space-y-3"
      >
        <SmartFilters />
        <QuickFilters />
        <TimeFilter />
        <AirlinesFilter initialAirlines={initialFlights} />
        <LocationFilters />
        <DurationFilter />
        <AccordionFilters />
        <FlightFilters />
      </motion.aside>

      <main className="flex-1 space-y-4">
        {/* Priceline Ad Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group"
        >
          <div className="p-4 md:p-6 flex-grow flex items-center gap-6">
            <div className="flex-shrink-0 w-20 h-6 relative opacity-80 group-hover:opacity-100 transition-opacity">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Priceline.com_logo.svg/1200px-Priceline.com_logo.svg.png"
                alt="Priceline"
                className="object-contain filter dark:brightness-0 dark:invert"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-black text-brand-dark group-hover:text-brand-dark transition-colors tracking-tight">
                Land a great deal for less.
              </h3>
              <p className="text-sm text-brand-dark-light/80 font-bold mt-0.5">
                Sponsored • Book your flight with confidence
              </p>
            </div>
          </div>
          <div className="flex-none w-52 p-5 flex items-center justify-center">
            <button className="mt-4 w-full bg-redmix dark:bg-brand-yellow hover:bg-brand-dark/90 text-white dark:text-white dark:border-redmix border-2 font-bold py-2.5 rounded-md cursor-pointer shadow-sm hover:shadow-md transition-all text-xs">
              Book Now
            </button>
          </div>
        </motion.div>

        {/* Dynamic Results Content with Sorting Tabs */}
        <Suspense fallback={<FlightResultSkeleton />}>
          <FlightResultContent
            initialFlights={filteredFlights}
            totalFlights={initialFlights.length}
            isLoading={isLoading}
          />
        </Suspense>
      </main>
    </div>
  );
}
