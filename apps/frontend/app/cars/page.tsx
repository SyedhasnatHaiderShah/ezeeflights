"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  ChevronDown,
  Sparkles,
  Car,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_CARS, CarCategory, CarRental } from "@/data/mock-cars";
import { CarCard } from "@/components/cars/CarCard";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { searchCars } from "@/lib/api/cars";

export default function CarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CarCategory | "All">(
    "All",
  );
  const [unlimitedMileageOnly, setUnlimitedMileageOnly] = useState(false);
  const [freeCancellationOnly, setFreeCancellationOnly] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const partners = useMemo(
    () => Array.from(new Set(MOCK_CARS.map((c) => c.partnerNetwork.name))),
    [],
  );
  const categories: (CarCategory | "All")[] = [
    "All",
    "Economy",
    "SUV",
    "Luxury",
    "Electric",
    "Van",
  ];

  const filteredCars = useMemo(() => {
    return MOCK_CARS.filter((car) => {
      const matchesSearch =
        car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || car.category === selectedCategory;
      const matchesMileage = !unlimitedMileageOnly || car.unlimitedMileage;
      const matchesCancellation = !freeCancellationOnly || car.freeCancellation;
      const matchesPartner =
        selectedPartners.length === 0 ||
        selectedPartners.includes(car.partnerNetwork.name);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMileage &&
        matchesCancellation &&
        matchesPartner
      );
    });
  }, [
    searchQuery,
    selectedCategory,
    unlimitedMileageOnly,
    freeCancellationOnly,
    selectedPartners,
  ]);

  const togglePartner = (partner: string) => {
    setSelectedPartners((prev) =>
      prev.includes(partner)
        ? prev.filter((p) => p !== partner)
        : [...prev, partner],
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Search Section */}
      <section className="pt-32 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-black text-brand-red tracking-widest">
            <Sparkles className="w-3 h-3" /> PREMIUM RENTALS
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Explore the road with{" "}
            <span className="text-brand-red">Confidence.</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground font-medium">
            Find the perfect vehicle for your next adventure. From electric city
            cars to luxury SUVs, we've got you covered.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative z-20 -mb-6">
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
            <div className="flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl bg-muted/30">
              <MapPin className="w-5 h-5 text-brand-red" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Pick-up Location
                </p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where are you heading?"
                  className="w-full bg-transparent font-bold text-sm outline-none placeholder:text-muted-foreground/30"
                />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl bg-muted/30">
              <Calendar className="w-5 h-5 text-brand-red" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Dates & Times
                </p>
                <p className="text-sm font-bold">
                  May 12, 10:00 AM — May 19, 10:00 AM
                </p>
              </div>
            </div>
            <Button className="h-auto py-6 px-10 rounded-3xl font-black text-lg shadow-xl shadow-brand-red/20">
              Search Cars
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-20 flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-12">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-10">
          <div className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Filter className="w-5 h-5 text-brand-red" /> Filters
            </h3>
            <div className="h-px bg-border/50" />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Vehicle Category
            </p>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all",
                    selectedCategory === cat
                      ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                      : "hover:bg-muted",
                  )}
                >
                  {cat}
                  {selectedCategory === cat && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Partner Network */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Partner Network
            </p>
            <div className="flex flex-wrap gap-2">
              {partners.map((partner) => (
                <button
                  key={partner}
                  onClick={() => togglePartner(partner)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border",
                    selectedPartners.includes(partner)
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-brand-red/50",
                  )}
                >
                  {partner}
                </button>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Rental Policies
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setUnlimitedMileageOnly(!unlimitedMileageOnly)}
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    unlimitedMileageOnly
                      ? "bg-brand-red border-brand-red"
                      : "border-border group-hover:border-brand-red/50",
                  )}
                >
                  {unlimitedMileageOnly && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs font-bold">Unlimited Mileage</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setFreeCancellationOnly(!freeCancellationOnly)}
                  className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    freeCancellationOnly
                      ? "bg-brand-red border-brand-red"
                      : "border-border group-hover:border-brand-red/50",
                  )}
                >
                  {freeCancellationOnly && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs font-bold">Free Cancellation</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black">
                {filteredCars.length}{" "}
                <span className="text-muted-foreground">Results found</span>
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Showing the best prices from our verified network.
              </p>
            </div>
            <button className="lg:hidden p-3 bg-card border border-border/50 rounded-2xl">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCars.map((car, index) => (
                <CarCard key={car.id} car={car} />
              ))}
            </AnimatePresence>

            {filteredCars.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="p-6 bg-muted/30 rounded-full">
                  <Car className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-black">No vehicles found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Try adjusting your filters or search terms to find available
                  rentals.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedPartners([]);
                    setUnlimitedMileageOnly(false);
                    setFreeCancellationOnly(false);
                  }}
                >
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
