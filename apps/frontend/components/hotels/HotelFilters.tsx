"use client";

import * as React from "react";
import { Star, Coffee, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PropertyType } from "@/lib/types/hotels";
import { useTranslation } from "react-i18next";

interface HotelFiltersProps {
  onFilterChange: (filters: any) => void;
  className?: string;
}

const PROPERTY_TYPES: PropertyType[] = [
  "Hotel",
  "Apartment",
  "Villa",
  "Resort",
  "Hostel",
  "Riad",
  "Boutique",
];

export function HotelFilters({ onFilterChange, className }: HotelFiltersProps) {
  const { t } = useTranslation();
  const [selectedTypes, setSelectedTypes] = React.useState<PropertyType[]>([]);
  const [selectedRatings, setSelectedRatings] = React.useState<number[]>([]);
  const [freeCancellation, setFreeCancellation] = React.useState(false);
  const [breakfastIncluded, setBreakfastIncluded] = React.useState(false);
  const [maxPrice, setMaxPrice] = React.useState(2000);

  const toggleType = (type: PropertyType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  React.useEffect(() => {
    onFilterChange({
      selectedTypes,
      selectedRatings,
      freeCancellation,
      breakfastIncluded,
      maxPrice,
    });
  }, [
    selectedTypes,
    selectedRatings,
    freeCancellation,
    breakfastIncluded,
    maxPrice,
  ]);

  return (
    <div className={cn("space-y-8 p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-sm", className)}>
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">
          {t("Property Type")}
        </h3>
        <div className="space-y-3">
          {PROPERTY_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                />
                <div className="w-5 h-5 border border-border rounded-md peer-checked:bg-brand-red peer-checked:border-brand-red transition-all duration-200" />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                {t(type)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">
          {t("Star Rating")}
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => toggleRating(rating)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-200",
                selectedRatings.includes(rating)
                  ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20"
                  : "bg-muted/30 border-border hover:border-brand-red/40 text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-xs font-bold leading-none mb-1">{rating}</span>
              <Star className={cn("w-3 h-3", selectedRatings.includes(rating) ? "fill-current" : "text-muted-foreground/50")} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground mb-4">
          {t("Amenities")}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={freeCancellation}
                onChange={() => setFreeCancellation(!freeCancellation)}
              />
              <div className="w-5 h-5 border border-border rounded-md peer-checked:bg-brand-red peer-checked:border-brand-red transition-all duration-200" />
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                {t("Free Cancellation")}
              </span>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={breakfastIncluded}
                onChange={() => setBreakfastIncluded(!breakfastIncluded)}
              />
              <div className="w-5 h-5 border border-border rounded-md peer-checked:bg-brand-red peer-checked:border-brand-red transition-all duration-200" />
              <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                {t("Breakfast Included")}
              </span>
            </div>
          </label>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm font-bold text-foreground">
            {t("Price Range")}
          </h3>
          <span className="text-xs font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-md">
            {t("Max AED")} {maxPrice}
          </span>
        </div>
        <div className="relative py-4">
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-red"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground font-bold">AED 100</span>
          <span className="text-[10px] text-muted-foreground font-bold">AED 5000</span>
        </div>
      </div>
    </div>
  );
}
