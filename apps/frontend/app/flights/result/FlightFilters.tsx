"use client";

import * as React from "react";
import { Filter, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { AppIcon } from "@/components/ui/app-icon";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";

export function FlightFilters() {
  const { filters, setFilter, resetFilters } = useFlightFilterStore();
  const stops = filters.stops;

  const [bags, setBags] = React.useState({
    carryOn: 0,
    checked: 0,
  });

  const stopsLabel = React.useMemo(() => {
    const active = Object.entries(stops)
      .filter(([_, v]) => v)
      .map(([k]) =>
        k === "nonstop" ? "Nonstop" : k === "oneStop" ? "1 Stop" : "2+ Stops",
      );

    if (active.length === 3) return "All Stops";
    if (active.length === 0) return "No Stops Selected";
    return active.join(", ");
  }, [stops]);

  return (
    <div className="filter-card">
      <div className="filter-card-header flex items-center gap-2">
        <Filter className="w-3 h-3 text-redmix/60" />
        <h3 className="filter-card-title">
          Additional Filters
        </h3>
      </div>

      <div className="filter-card-body space-y-4">
        {/* Stops Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground ml-0.5">
            Stops
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between w-full px-2.5 py-2 text-xs font-bold border rounded-lg bg-background hover:bg-muted transition-all border-border shadow-sm group cursor-pointer">
                <span className="truncate text-foreground/80">
                  {stopsLabel}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="start">
              <DropdownMenuLabel className="text-xs font-bold opacity-80 ">
                Filter by Stops
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={stops.nonstop}
                onCheckedChange={(v) =>
                  setFilter("stops", { ...stops, nonstop: v })
                }
                className="text-xs font-semibold"
              >
                Nonstop
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={stops.oneStop}
                onCheckedChange={(v) =>
                  setFilter("stops", { ...stops, oneStop: v })
                }
                className="text-xs font-semibold"
              >
                1 stop
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={stops.twoStops}
                onCheckedChange={(v) =>
                  setFilter("stops", { ...stops, twoStops: v })
                }
                className="text-xs font-semibold"
              >
                2+ stops
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-px bg-border/30" />

        {/* Amenities */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground ml-0.5">
              Amenities
            </Label>
            <p className="text-xs text-foreground/80 mt-0.5 font-bold ">
              Bags per passenger
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground/70">
                Carry-on bag
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() =>
                    setBags((b) => ({
                      ...b,
                      carryOn: Math.max(0, b.carryOn - 1),
                    }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-semibold text-foreground/60 hover:bg-muted transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-3 text-center text-xs font-semibold text-foreground">
                  {bags.carryOn}
                </span>
                <button
                  onClick={() =>
                    setBags((b) => ({ ...b, carryOn: b.carryOn + 1 }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-semibold text-foreground/60 hover:bg-muted transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground/60">
                Checked bag
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() =>
                    setBags((b) => ({
                      ...b,
                      checked: Math.max(0, b.checked - 1),
                    }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-semibold text-foreground/40 hover:bg-muted transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-3 text-center text-xs font-semibold text-foreground">
                  {bags.checked}
                </span>
                <button
                  onClick={() =>
                    setBags((b) => ({ ...b, checked: b.checked + 1 }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-semibold text-foreground/40 hover:bg-muted transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3.5 py-3 border-t border-border/30 bg-muted/20 flex flex-col gap-2">
        <button 
          className="w-full h-9 rounded-lg bg-redmix/10 text-redmix text-xs font-bold hover:bg-redmix/20 transition-all cursor-pointer"
          onClick={resetFilters}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}
