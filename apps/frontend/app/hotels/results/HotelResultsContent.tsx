"use client";

import React, { useState, useMemo } from "react";
import * as motion from "framer-motion/client";
import { Drawer } from "vaul";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { HotelCard } from "@/components/hotels/HotelCard";
import { HotelFilterSidebar } from "@/components/hotels/HotelFilterSidebar";
import { HotelAiSuggestionsPanel } from "./HotelAiSuggestionsPanel";
import { cn } from "@/lib/utils";

import { Hotel } from "@/lib/api/hotels";

interface Props {
  initialData: Hotel[];
  city: string;
  checkInDate: string;
  checkOutDate: string;
  query: string;
}

export function HotelResultsContent({
  initialData,
  city,
  checkInDate,
  checkOutDate,
  query,
}: Props) {
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState("Recommended");
  const [openFilters, setOpenFilters] = useState(false);
  const [openAiTips, setOpenAiTips] = useState(false);

  const filteredData = useMemo(() => {
    let data = [...initialData].filter((h) => h.minPricePerNight <= maxPrice);

    if (sortBy === "Price") {
      data.sort((a, b) => a.minPricePerNight - b.minPricePerNight);
    } else if (sortBy === "Rating") {
      data.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    }

    return data;
  }, [initialData, maxPrice, sortBy]);

  return (
    <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)_380px] gap-4 md:h-[calc(100vh-8rem)] px-4 md:overflow-hidden relative">
      {/* Column 1: Filters (Desktop) */}
      <div className="hidden lg:block h-full overflow-y-auto no-scrollbar border-r border-border/50 pr-4">
        <HotelFilterSidebar maxPrice={maxPrice} onPriceChange={setMaxPrice} />
      </div>

      {/* Column 2: Main Results */}
      <main className="md:py-5 py-2 space-y-4 min-w-0 md:h-full md:overflow-y-auto no-scrollbar">
        {/* Sticky Mobile Controls */}
        <div className="sticky top-0 z-30 md:static bg-slate-50/95 dark:bg-background/95 backdrop-blur-sm -mx-4 px-4 md:p-0 md:bg-transparent mb-4">
          <div className="flex items-center gap-2 lg:hidden mb-3">
            <button
              onClick={() => setOpenFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-card text-sm font-bold text-foreground shadow-sm active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="h-4 w-4 text-redmix" />
              Filters
            </button>
            <button
              onClick={() => setOpenAiTips(true)}
              className="flex-1 md:hidden flex items-center justify-center gap-2 py-2.5 rounded-xl border border-redmix/20 bg-redmix/5 text-sm font-bold text-redmix shadow-sm active:scale-95 transition-transform"
            >
              <Sparkles className="h-4 w-4" />
              AI Tips
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-2xl border border-border bg-card px-4 py-2 md:shadow-none shadow-sm mb-4">
            <p className="text-xs font-semibold text-foreground capitalize">
              {filteredData.length} Properties Found
            </p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {["Recommended", "Price", "Rating", "Distance"].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  type="button"
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase transition-all border shrink-0",
                    sortBy === sort
                      ? "bg-redmix text-white border-redmix shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:bg-muted",
                  )}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-20">
          {filteredData.length > 0 ? (
            filteredData.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <HotelCard
                  hotel={hotel}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-black uppercase tracking-widest">
                {initialData.length === 0
                  ? "No properties available for these dates"
                  : "No hotels found in this budget"}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {initialData.length === 0
                  ? "Try searching for a different city or dates."
                  : "Try increasing your nightly budget filter."}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Column 3: AI Suggestions (Desktop & Tablet) */}
      <div className="hidden md:block py-5 h-full overflow-y-auto no-scrollbar border-l border-border/50">
        <HotelAiSuggestionsPanel hotels={filteredData} city={city} />
      </div>

      {/* Mobile Drawer: Filters */}
      <Drawer.Root open={openFilters} onOpenChange={setOpenFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[70]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] h-[85vh] rounded-t-2xl bg-background outline-none">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />
            <div className="px-4 pb-8 overflow-y-auto h-full">
              <HotelFilterSidebar
                maxPrice={maxPrice}
                onPriceChange={setMaxPrice}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Mobile Drawer: AI Tips */}
      <Drawer.Root open={openAiTips} onOpenChange={setOpenAiTips}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[70]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] h-[85vh] rounded-t-2xl bg-background outline-none">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-4" />
            <HotelAiSuggestionsPanel
              onClose={() => setOpenAiTips(false)}
              hotels={filteredData}
              city={city}
            />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
