"use client";

import * as React from "react";
import { Sparkles, Info, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";

export function SmartFilters() {
  const { filters, setFilter } = useFlightFilterStore();

  return (
    <div className="filter-card">
      <div className="filter-card-body space-y-3">
        {/* Smart Filters AI Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-center p-1.5 rounded-lg bg-brand-dark/[0.03] border border-border/40">
            <div className="flex items-center gap-1.5 text-brand-dark">
              <Sparkles className="w-3 h-3 fill-brand-dark" />
              <span className="text-sm font-semibold tracking-wide">Aero Insights</span>
            </div>
          </div>

          <div className="rounded-xl transition-all">
            <div className="flex items-start gap-1.5 mb-2 pl-0.5">
              <Info className="w-4 h-4 text-brand-yellow mt-0.5" />
              <p className="text-xs text-brand-dark-light/80 font-semibold">
                AI powered search.{" "}
                <button className="text-brand-redmix cursor-pointer text-xs hover:underline underline-offset-2">
                  Learn more
                </button>
              </p>
            </div>

            <div className="relative group/input">
              <textarea
                value={filters.smartQuery}
                onChange={(e) => setFilter("smartQuery", e.target.value)}
                placeholder="I want to see flights with no layover under $300."
                className="w-full min-h-[60px] p-2.5 text-xs bg-background/30 border border-border/60 rounded-lg outline-none focus:border-brand-dark/30 focus:ring-4 focus:ring-brand-dark/5 transition-all placeholder:text-brand-dark-light/80 font-medium leading-relaxed resize-none placeholder:text-xs"
              />
            </div>
          </div>
          <button
            className={cn(
              "rounded-md py-2 w-full flex items-center cursor-pointer justify-center h-8 gap-2 text-xs font-bold transition-all shadow-sm",
              filters.smartQuery.trim()
                ? "bg-brand-dark text-white hover:bg-brand-dark/90"
                : "bg-white text-redmix cursor-not-allowed border-redmix/20 border",
            )}
            disabled={!filters.smartQuery.trim()}
          >
            ASK AI SEARCH
          </button>
        </div>
      </div>
    </div>
  );
}
