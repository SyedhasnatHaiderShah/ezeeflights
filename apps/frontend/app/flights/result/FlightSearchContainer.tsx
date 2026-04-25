"use client";

import React, { useMemo, useState } from "react";
import { Drawer } from "vaul";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";
import { Button } from "@/components/ui/button";
import { FlightListItem } from "@/lib/types/flight-api";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { filterFlights } from "@/lib/utils/filter-flights";
import { FlightCard } from "@/components/flights/FlightCard";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import { FilterSidebar } from "@/components/flights/FilterSidebar";
import { AiSuggestionsPanel } from "./AiSuggestionsPanel";
import { cn } from "@/lib/utils";

interface Props {
  initialFlights: FlightListItem[];
  isLoading?: boolean;
}

type SortMode = "best" | "cheapest" | "fastest" | "duration";

export function FlightSearchContainer({ initialFlights, isLoading }: Props) {
  const { filters, setFilter } = useFlightFilterStore();
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [openFilters, setOpenFilters] = useState(false);
  const [openAiTips, setOpenAiTips] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(10);

  // Extract origin/destination for AI panel
  const route = useMemo(() => {
    if (initialFlights.length === 0)
      return { origin: "Origin", destination: "Destination" };
    const firstLeg = initialFlights[0].outbound[0];
    return {
      origin: firstLeg.fromAirport.cityCode || firstLeg.fromAirport.code,
      destination: firstLeg.toAirport.cityCode || firstLeg.toAirport.code,
    };
  }, [initialFlights]);

  React.useEffect(() => {
    if (initialFlights.length > 0) {
      const prices = initialFlights.map((f) => f.totalCost);
      setFilter("priceRange", [
        Math.floor(Math.min(...prices)),
        Math.ceil(Math.max(...prices)),
      ]);
    }
  }, [initialFlights, setFilter]);

  const filteredFlights = useMemo(
    () => filterFlights(initialFlights, filters),
    [initialFlights, filters],
  );

  const sortedFlights = useMemo(() => {
    const flights = [...filteredFlights];
    if (sortMode === "cheapest")
      return flights.sort((a, b) => a.totalCost - b.totalCost);
    if (sortMode === "fastest" || sortMode === "duration")
      return flights.sort((a, b) => a.totalTime - b.totalTime);
    return flights.sort(
      (a, b) => a.totalCost / 5 + a.totalTime - (b.totalCost / 5 + b.totalTime),
    );
  }, [filteredFlights, sortMode]);

  const visibleFlights = sortedFlights.slice(0, displayedCount);

  if (isLoading) return <FlightResultSkeleton />;

  return (
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[18%_1fr_40%] gap-4 md:h-[calc(100vh-3rem)]  px-4 md:overflow-hidden">
      {/* Column 1: Filters (Desktop) */}
      <div className="hidden md:block h-full overflow-y-auto no-scrollbar border-r border-border/50">
        <FilterSidebar
          flights={initialFlights}
          resultsCount={sortedFlights.length}
        />
      </div>

      {/* Column 2: Main Results */}
      <main className="md:py-5 py-2 space-y-3 min-w-0 md:h-full md:overflow-y-auto no-scrollbar">
        {/* Sticky Mobile Controls */}
        <div className="sticky top-[118px] z-30 md:static bg-slate-50/95 dark:bg-background/95 backdrop-blur-sm -mx-4 px-2 md:p-0 md:bg-transparent">
          <div className="flex items-center gap-2 md:hidden mb-1.5">
            <button
              onClick={() => setOpenFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl border border-border bg-card text-sm font-bold text-foreground shadow-sm active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="h-4 w-4 text-redmix" />
              Filters
            </button>
            <button
              onClick={() => setOpenAiTips(true)}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl border border-redmix/20 bg-redmix/5 text-sm font-bold text-redmix shadow-sm active:scale-95 transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              AI Tips
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-md border border-border bg-card px-4 py-2 md:shadow-none shadow-sm">
            <p className="text-xs font-semibold text-foreground capitalize">
              {sortedFlights.length} flights found
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
              {(["best", "cheapest", "fastest", "duration"] as SortMode[]).map(
                (item) => (
                  <button
                    key={item}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium uppercase transition-all border shrink-0",
                      sortMode === item
                        ? "bg-redmix text-white border-redmix shadow-sm"
                        : "bg-transparent text-muted-foreground border-border",
                    )}
                    onClick={() => setSortMode(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {sortedFlights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
            <p className="text-4xl">🛫</p>
            <h3 className="text-xl font-semibold">No flights found</h3>
            <p className="text-sm text-muted-foreground">
              Try modifying your filters or search dates.
            </p>
            <div className="flex items-center justify-center gap-2 md:hidden">
              <Button variant="outline" onClick={() => setOpenFilters(true)}>
                Modify filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-20 md:pb-6">
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
          <div className="flex justify-center pt-2 pb-10">
            <Button
              variant="ghost"
              onClick={() => setDisplayedCount((c) => c + 10)}
            >
              Load more
            </Button>
          </div>
        )}
      </main>

      {/* Column 3: AI Suggestions (Desktop) */}
      <div className="hidden lg:block py-5 h-full overflow-y-auto no-scrollbar border-l border-border/50">
        <AiSuggestionsPanel
          flights={sortedFlights}
          origin={route.origin}
          destination={route.destination}
        />
      </div>

      {/* Mobile Drawer: Filters */}
      <Drawer.Root open={openFilters} onOpenChange={setOpenFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[70]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] h-[85vh] rounded-t-2xl bg-background outline-none">
            <Drawer.Title className="sr-only">Flight Filters</Drawer.Title>
            <Drawer.Description className="sr-only">
              Adjust your flight search results using various filters.
            </Drawer.Description>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />
            <FilterSidebar
              onClose={() => setOpenFilters(false)}
              flights={initialFlights}
              resultsCount={sortedFlights.length}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Mobile Drawer: AI Tips */}
      <Drawer.Root open={openAiTips} onOpenChange={setOpenAiTips}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[70]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] h-[85vh] rounded-t-2xl bg-background outline-none">
            <Drawer.Title className="sr-only">AI Suggestions</Drawer.Title>
            <Drawer.Description className="sr-only">
              AI-powered insights and tips for your flight selection.
            </Drawer.Description>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />
            <AiSuggestionsPanel
              onClose={() => setOpenAiTips(false)}
              flights={sortedFlights}
              origin={route.origin}
              destination={route.destination}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
