"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Sparkles,
  Car,
  Check,
  SlidersHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { CarAiSuggestionsPanel } from "@/components/cars/CarAiSuggestionsPanel";
import { beginDestinationInsightsSearch } from "@/lib/api/destination-insights";
import { extractIataCodeFromLocation } from "@/lib/store/destination-insights-store";
import { parseCarSearchParams } from "@/lib/utils/car-search-params";
import { useTranslation } from "react-i18next";
import { CarCard } from "./CarCard";
import { CarFilterSidebar } from "./CarFilterSidebar";
import { CarStickySearchPanel } from "./CarStickySearchPanel";

type TravelportCar = {
  id: string;
  name: string;
  acrissCode?: string;
  category: string;
  partnerNetwork: { name: string };
  pricePerDay: number;
  totalPrice?: number;
  currency: string;
  features: string[];
  unlimitedMileage: boolean;
  freeCancellation: boolean;
  location: string;
  description?: string;
  warnings?: string[];
  vendorLocationKey?: string | null;
  rateToken?: string | null;
  [key: string]: any;
};

interface Props {
  initialCars: TravelportCar[];
  error?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
}

const CATEGORIES = [
  "All",
  "Economy",
  "Intermediate",
  "Compact",
  "Fullsize",
  "SUV",
  "Luxury",
];

export function CarResultsContainer({
  initialCars,
  error,
  pickupLocation,
  dropoffLocation,
  pickupDate,
  dropoffDate,
}: Props) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [unlimitedMileageOnly, setUnlimitedMileageOnly] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [openFilters, setOpenFilters] = useState(false);
  const [openAiTips, setOpenAiTips] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [sortMode, setSortMode] = useState<
    "cheapest" | "recommended" | "expensive"
  >("cheapest");
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoading, stopLoading } = useLoadingStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const resolvedSearch = useMemo(() => {
    const fromUrl = parseCarSearchParams(searchParams);
    return {
      pickup: pickupLocation || fromUrl.pickup,
      dropoff: dropoffLocation || fromUrl.dropoff,
      pickupDate: pickupDate || fromUrl.pickupDate,
      dropoffDate: dropoffDate || fromUrl.dropoffDate,
    };
  }, [searchParams, pickupLocation, dropoffLocation, pickupDate, dropoffDate]);

  const globalWarnings = useMemo(() => {
    for (const car of initialCars) {
      if (
        car.warnings &&
        Array.isArray(car.warnings) &&
        car.warnings.length > 0
      ) {
        return car.warnings;
      }
    }
    return [];
  }, [initialCars]);

  const setIsSelectingCarGlobal = useBookingFlowStore(
    (s) => s.setIsSelectingCar,
  );

  // Stop the global loader once results are rendered
  useEffect(() => {
    if (isLoading) {
      stopLoading();
    }
  }, [isLoading, stopLoading]);

  useEffect(() => {
    setIsSelectingCarGlobal(false);
  }, [setIsSelectingCarGlobal]);

  const partners = useMemo(
    () =>
      Array.from(
        new Set(
          initialCars
            .map((c) => c.partnerNetwork?.name)
            .filter((name) => name && name.trim().length > 0),
        ),
      ),
    [initialCars],
  );

  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      const matchesCategory =
        selectedCategory === "All" ||
        car.category?.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesMileage = !unlimitedMileageOnly || car.unlimitedMileage;
      const matchesPartner =
        selectedPartners.length === 0 ||
        selectedPartners.includes(car.partnerNetwork?.name);
      return matchesCategory && matchesMileage && matchesPartner;
    });
  }, [initialCars, selectedCategory, unlimitedMileageOnly, selectedPartners]);

  const sortedCars = useMemo(() => {
    const cars = [...filteredCars];
    if (sortMode === "cheapest") {
      return cars.sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
    if (sortMode === "expensive") {
      return cars.sort((a, b) => b.pricePerDay - a.pricePerDay);
    }
    return cars;
  }, [filteredCars, sortMode]);
  
  const PAGE_SIZE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, unlimitedMileageOnly, selectedPartners, sortMode]);

  const paginatedCars = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedCars.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedCars, currentPage]);

  const togglePartner = (partner: string) => {
    setSelectedPartners((prev) =>
      prev.includes(partner)
        ? prev.filter((p) => p !== partner)
        : [...prev, partner],
    );
  };

  const handleReload = async () => {
    startTransition(() => {
      router.refresh();
    });
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!isPending) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 5000);
    });
  };

  const rentalDays = useMemo(() => {
    const { pickupDate: start, dropoffDate: end } = resolvedSearch;
    if (!start || !end) return 1;
    return Math.max(
      1,
      Math.ceil(
        (new Date(end).getTime() - new Date(start).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }, [resolvedSearch]);

  const pickupCode = extractIataCodeFromLocation(resolvedSearch.pickup);
  const dropoffCode = extractIataCodeFromLocation(
    resolvedSearch.dropoff || resolvedSearch.pickup,
  );

  useEffect(() => {
    if (pickupCode.length === 3) {
      beginDestinationInsightsSearch(pickupCode);
    }
    if (dropoffCode.length === 3 && dropoffCode !== pickupCode) {
      beginDestinationInsightsSearch(dropoffCode);
    }
  }, [pickupCode, dropoffCode]);

  const categories = useMemo(() => {
    return CATEGORIES.filter((cat) => {
      if (cat === "All") return true;
      return initialCars.some((car) =>
        car.category?.toLowerCase().includes(cat.toLowerCase()),
      );
    });
  }, [initialCars]);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden max-md:h-auto max-md:overflow-y-auto">
      <Header />

      {/* Collapsible Sticky Search Panel */}
      <CarStickySearchPanel
        pickupLocation={resolvedSearch.pickup}
        dropoffLocation={resolvedSearch.dropoff}
        pickupDate={resolvedSearch.pickupDate}
        dropoffDate={resolvedSearch.dropoffDate}
        rentalDays={rentalDays}
      />

      {/* Main Content Layout with 3 Columns */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 mt-12 pt-6 pb-0 flex-1 min-h-0 overflow-hidden max-md:overflow-visible max-md:h-auto">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[240px_minmax(0,1fr)_380px] gap-6 h-full min-h-0">
          {/* Column 1: Filters (Left Sidebar, Desktop only) */}
          <aside className="hidden lg:block border-r border-border/50 pr-4 h-full overflow-y-auto no-scrollbar">
            <CarFilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              partners={partners}
              selectedPartners={selectedPartners}
              togglePartner={togglePartner}
              unlimitedMileageOnly={unlimitedMileageOnly}
              setUnlimitedMileageOnly={setUnlimitedMileageOnly}
            />
          </aside>

          {/* Column 2: Results List (Middle Column) */}
          <main className="space-y-6 overflow-y-auto no-scrollbar h-full pr-1 flex flex-col min-h-0 max-md:overflow-visible max-md:h-auto">
            {/* <PullToRefresh onRefresh={handleReload}> */}
            {/* Sticky Mobile Controls — iOS segmented control */}
            <div className="sticky top-0 z-30 lg:hidden bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border-b border-border/40 -mx-4 px-4 py-2 mb-1">
              <div className="flex rounded-[10px] bg-muted/60 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
                <button
                  onClick={() => setOpenFilters(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-[13px] font-semibold text-foreground active:bg-background active:shadow-sm transition-all duration-150"
                >
                  <SlidersHorizontal
                    className="h-3.5 w-3.5 text-foreground/80"
                    strokeWidth={2.25}
                  />
                  {t("Filters")}
                </button>
                <div
                  className="w-px bg-border/50 my-1.5 shrink-0"
                  aria-hidden
                />
                <button
                  onClick={() => setOpenAiTips(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-[13px] font-semibold text-foreground active:bg-background active:shadow-sm transition-all duration-150"
                >
                  <Sparkles
                    className="h-3.5 w-3.5 text-redmix dark:text-white"
                    strokeWidth={2.25}
                  />
                  {t("AI Insight")}
                </button>
              </div>
            </div>

            {/* Premium Sort bar (Desktop and Mobile) */}
            <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-2xl border border-border bg-card px-4 py-2 md:shadow-none shadow-sm mb-3">
              <p className="text-xs font-semibold text-foreground capitalize">
                {sortedCars.length}{" "}
                {sortedCars.length === 1
                  ? t("vehicle found")
                  : t("vehicles found")}
              </p>
              <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2">
                  {t("Sorted By")}
                </span>
                {(["recommended", "cheapest", "expensive"] as const).map(
                  (item) => (
                    <button
                      key={item}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium uppercase transition-all border shrink-0",
                        sortMode === item
                          ? "bg-redmix text-white border-redmix shadow-sm"
                          : "bg-transparent text-muted-foreground border-border hover:bg-muted",
                      )}
                      onClick={() => setSortMode(item)}
                    >
                      {t(item)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
                <p className="text-sm font-bold text-destructive">
                  {t("Search Error")}
                </p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 pb-20 lg:pb-6">
              <AnimatePresence mode="popLayout">
                {paginatedCars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CarCard
                      car={car}
                      pickupDate={resolvedSearch.pickupDate}
                      dropoffDate={resolvedSearch.dropoffDate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {sortedCars.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-border/40 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl font-bold text-xs"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("Previous")}
                  </Button>
                  <span className="text-xs font-semibold text-muted-foreground px-2">
                    {t("Page")} {currentPage} {t("of")} {Math.ceil(sortedCars.length / PAGE_SIZE)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(sortedCars.length / PAGE_SIZE), p + 1))}
                    disabled={currentPage === Math.ceil(sortedCars.length / PAGE_SIZE)}
                    className="rounded-xl font-bold text-xs"
                  >
                    {t("Next")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {sortedCars.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-border rounded-3xl bg-card">
                  <div className="p-5 bg-muted/30 rounded-full">
                    <Car className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-black">
                    {t("No vehicles matches filters")}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {t("Try adjusting your sidebar filters to see more available car rentals.")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedPartners([]);
                      setUnlimitedMileageOnly(false);
                    }}
                    className="rounded-xl font-bold text-xs"
                  >
                    {t("Clear Filters")}
                  </Button>
                </div>
              )}
            </div>
            {/* </PullToRefresh> */}
          </main>

          {/* Column 3: AI suggestions panel (Right Sidebar, Desktop & Tablet) */}
          <div className="hidden md:block min-h-0 border-l border-border/50 pl-4 py-2 overflow-y-auto no-scrollbar space-y-4">
            <CarAiSuggestionsPanel
              pickup={resolvedSearch.pickup}
              dropoff={resolvedSearch.dropoff || resolvedSearch.pickup}
              pickupDate={resolvedSearch.pickupDate}
              dropoffDate={resolvedSearch.dropoffDate}
              showHotels={true}
              warnings={globalWarnings}
              className="pb-6"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer: Filters */}
      <Drawer.Root open={openFilters} onOpenChange={setOpenFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] border-t border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none">
            <Drawer.Title className="sr-only">{t("Car Filters")}</Drawer.Title>
            <Drawer.Description className="sr-only">
              {t(
                "Filter car search results based on category, vendor, and policies.",
              )}
            </Drawer.Description>
            <div className="mx-auto mt-2.5 mb-3 h-[5px] w-9 shrink-0 rounded-full bg-foreground/20" />
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-8">
              <CarFilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                partners={partners}
                selectedPartners={selectedPartners}
                togglePartner={togglePartner}
                unlimitedMileageOnly={unlimitedMileageOnly}
                setUnlimitedMileageOnly={setUnlimitedMileageOnly}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Mobile Drawer: AI Tips */}
      <Drawer.Root open={openAiTips} onOpenChange={setOpenAiTips}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] border-t border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none">
            <Drawer.Title className="sr-only">
              {t("AI Suggestions")}
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              {t(
                "View AI recommendations and destination insights for car rentals.",
              )}
            </Drawer.Description>
            <div className="mx-auto mt-2.5 mb-3 h-[5px] w-9 shrink-0 rounded-full bg-foreground/20" />
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-8">
              <CarAiSuggestionsPanel
                pickup={resolvedSearch.pickup}
                dropoff={resolvedSearch.dropoff || resolvedSearch.pickup}
                pickupDate={resolvedSearch.pickupDate}
                dropoffDate={resolvedSearch.dropoffDate}
                showHotels={true}
                warnings={globalWarnings}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
