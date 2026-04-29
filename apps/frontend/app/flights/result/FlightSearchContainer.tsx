"use client";

import React, { useMemo, useState } from "react";
import { Drawer } from "vaul";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlightListItem } from "@/lib/types/flight-api";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { filterFlights } from "@/lib/utils/filter-flights";
import { FlexibleDateMatrix } from "@/components/flights/FlexibleDateMatrix";
import { FilterSidebar } from "@/components/flights/FilterSidebar";
import { FlightCard } from "@/components/flights/FlightCard";
import { AiSuggestionsPanel } from "./AiSuggestionsPanel";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";

type SortMode = "best" | "cheapest" | "fastest" | "duration";

interface Props {
  initialFlights: FlightListItem[];
  isLoading?: boolean;
  totalCount: number;
  currentPage: number;
}

export function FlightSearchContainer({
  initialFlights,
  isLoading,
  totalCount,
  currentPage,
}: Props) {
  const { filters, setFilter } = useFlightFilterStore();
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [openFilters, setOpenFilters] = useState(false);
  const [openAiTips, setOpenAiTips] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const basePrice = useMemo(() => {
    if (initialFlights.length === 0) return 0;
    return Math.min(...initialFlights.map((f) => f.totalCost));
  }, [initialFlights]);

  const departureDate = useMemo(() => {
    return searchParams.get("dDate") || new Date().toISOString().split("T")[0];
  }, [searchParams]);

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

  // ... rest of the component

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

  const limit = 10;
  const totalPages = Math.ceil(totalCount / limit);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) return <FlightResultSkeleton />;

  return (
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)_380px] gap-4 md:h-[calc(100vh-3rem)] px-4 md:overflow-hidden">
      {/* Column 1: Filters (Desktop) */}
      <div className="hidden lg:block h-full overflow-y-auto no-scrollbar border-r border-border/50">
        <FilterSidebar
          flights={initialFlights}
          resultsCount={sortedFlights.length}
        />
      </div>

      {/* Column 2: Main Results */}
      <main className="md:py-5 py-2 space-y-3 min-w-0 md:h-full md:overflow-y-auto no-scrollbar">
        <FlexibleDateMatrix
          departureDate={departureDate}
          basePrice={basePrice}
        />

        {/* Sticky Mobile Controls */}
        <div className="sticky top-[118px] z-30 md:static bg-slate-50/95 dark:bg-background/95 backdrop-blur-sm -mx-4 px-2 md:p-0 md:bg-transparent">
          <div className="flex items-center gap-2 lg:hidden mb-1.5">
            <button
              onClick={() => setOpenFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl border border-border bg-card text-sm font-bold text-foreground shadow-sm active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="h-4 w-4 text-redmix" />
              Filters
            </button>
            <button
              onClick={() => setOpenAiTips(true)}
              className="flex-1 md:hidden flex items-center justify-center gap-2 py-1.5 rounded-xl border border-redmix/20 bg-redmix/5 text-sm font-bold text-redmix shadow-sm active:scale-95 transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              AI Tips
            </button>
          </div>

          <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-2xl border border-border bg-card px-4 py-2 md:shadow-none shadow-sm">
            <p className="text-xs font-semibold text-foreground capitalize">
              {totalCount} flights found · Page {currentPage} of{" "}
              {totalPages || 1}
            </p>
            <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
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
            {sortedFlights.map((flight, index) => (
              <motion.div
                key={flight.flightId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FlightCard flight={flight} />
              </motion.div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  ← Back
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Column 3: AI Suggestions (Desktop & Tablet) */}
      <div className="hidden md:block py-5 h-full overflow-y-auto no-scrollbar border-l border-border/50">
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
              sortMode={sortMode}
              onSortChange={setSortMode}
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
