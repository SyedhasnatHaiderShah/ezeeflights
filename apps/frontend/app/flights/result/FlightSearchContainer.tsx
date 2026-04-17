"use client";

import React, { useMemo, useState } from "react";
import { Drawer } from "vaul";
import { SlidersHorizontal } from "lucide-react";
import * as motion from "framer-motion/client";
import { Button } from "@/components/ui/button";
import { FlightListItem } from "@/lib/types/flight-api";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { filterFlights } from "@/lib/utils/filter-flights";
import { FlightCard } from "@/components/flights/FlightCard";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { FilterSidebar } from "@/components/flights/FilterSidebar";

interface Props {
  initialFlights: FlightListItem[];
  isLoading?: boolean;
}

type SortMode = "best" | "cheapest" | "fastest" | "duration";

export function FlightSearchContainer({ initialFlights, isLoading }: Props) {
  const { filters, setFilter } = useFlightFilterStore();
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [openFilters, setOpenFilters] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10);

  React.useEffect(() => {
    if (initialFlights.length > 0) {
      const prices = initialFlights.map((f) => f.totalCost);
      setFilter("priceRange", [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))]);
    }
  }, [initialFlights, setFilter]);

  const filteredFlights = useMemo(() => filterFlights(initialFlights, filters), [initialFlights, filters]);

  const sortedFlights = useMemo(() => {
    const flights = [...filteredFlights];
    if (sortMode === "cheapest") return flights.sort((a, b) => a.totalCost - b.totalCost);
    if (sortMode === "fastest" || sortMode === "duration") return flights.sort((a, b) => a.totalTime - b.totalTime);
    return flights.sort((a, b) => a.totalCost / 5 + a.totalTime - (b.totalCost / 5 + b.totalTime));
  }, [filteredFlights, sortMode]);

  const visibleFlights = sortedFlights.slice(0, displayedCount);

  if (isLoading) return <FlightResultSkeleton />;

  return (
    <div className="max-w-[1240px] mx-auto flex gap-4 min-h-[calc(100vh-13rem)]">
      <div className="w-72 shrink-0 hidden md:block">
        <FilterSidebar flights={initialFlights} resultsCount={sortedFlights.length} />
      </div>

      <main className="flex-1 px-4 md:px-0 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">{sortedFlights.length} flights found</p>
          <div className="flex items-center gap-2 overflow-x-auto">
            {(["best", "cheapest", "fastest", "duration"] as SortMode[]).map((item) => (
              <button
                key={item}
                className={`rounded-full px-3 py-1 text-xs capitalize border ${sortMode === item ? "bg-brand-red text-white border-brand-red" : "bg-transparent"}`}
                onClick={() => setSortMode(item)}
              >
                {item}
              </button>
            ))}
            <button className="md:hidden rounded-full px-3 py-1 text-xs border flex items-center gap-1" onClick={() => setOpenFilters(true)}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>

        {sortedFlights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-4xl">🛫</p>
            <h3 className="text-xl font-semibold">No flights found</h3>
            <p className="text-sm text-muted-foreground">Try modifying your filters or search dates.</p>
            <Button variant="outline" onClick={() => setOpenFilters(true)} className="md:hidden">Modify search</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleFlights.map((flight, index) => (
              <motion.div
                key={flight.flightId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FlightCard flight={flight} />
              </motion.div>
            ))}
          </div>
        )}

        {displayedCount < sortedFlights.length && (
          <div className="flex justify-center pt-2">
            <Button variant="ghost" onClick={() => setDisplayedCount((c) => c + 10)}>Load more</Button>
          </div>
        )}
      </main>

      <Drawer.Root open={openFilters} onOpenChange={setOpenFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[70]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] h-[85vh] rounded-t-2xl bg-background">
            <FilterSidebar onClose={() => setOpenFilters(false)} flights={initialFlights} resultsCount={sortedFlights.length} />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
