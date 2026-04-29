"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FilterProps {
  maxPrice: number;
  onPriceChange: (val: number) => void;
  resultsCount?: number;
}

const sectionLabel = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block";

export function HotelFilterSidebar({ maxPrice, onPriceChange, resultsCount }: FilterProps) {
  return (
    <aside className="w-full bg-card border-r border-border h-full overflow-y-auto p-3 min-h-screen no-scrollbar">
      <h2 className="text-sm font-bold uppercase tracking-widest mb-6 px-1">Filters</h2>

      <Accordion
        type="multiple"
        defaultValue={["price", "stars", "rating", "type"]}
        className="space-y-2"
      >
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest py-3 hover:no-underline">
            Nightly Budget
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 px-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-redmix">
                  Up to{" "}
                  <CurrencyDisplay
                    amount={maxPrice}
                    currency="USD"
                    showComparison={false}
                    className="inline-block"
                  />
                </div>
              </div>
              <Slider
                value={[maxPrice]}
                onValueChange={(val) => onPriceChange(val[0])}
                min={50}
                max={1000}
                step={10}
                className="py-2"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>$50</span>
                <span>$1000+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stars" className="border-none">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest py-3 hover:no-underline">
            Star Rating
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 px-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <label
                  key={star}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <Checkbox className="border-slate-200 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-brand-red transition-colors flex items-center gap-1">
                    {star} {star === 1 ? 'Star' : 'Stars'}
                    <span className="text-amber-500">★</span>
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating" className="border-none">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest py-3 hover:no-underline">
            Guest Rating
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 px-1">
            <div className="space-y-2">
              {["Any", "7+", "8+", "9+"].map((label) => (
                <label
                  key={label}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="guest-rating"
                    defaultChecked={label === "Any"}
                    className="accent-brand-red w-3.5 h-3.5"
                  />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-brand-red transition-colors">
                    {label === "Any" ? "All Ratings" : `${label} Excellent`}
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="type" className="border-none">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest py-3 hover:no-underline">
            Property Type
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4 px-1">
            <div className="space-y-2">
              {["Hotel", "Resort", "Apartments", "Villa"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <Checkbox className="border-slate-200 data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-brand-red transition-colors">
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
        <button className="text-[10px] font-black uppercase tracking-widest text-brand-red hover:underline">
          Reset All
        </button>
        {resultsCount !== undefined && (
          <span className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-full">
            {resultsCount} Results
          </span>
        )}
      </div>
    </aside>
  );
}

