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

export function FlightFilters() {
  const [stops, setStops] = React.useState({
    nonstop: true,
    oneStop: true,
    twoStops: true,
  });

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
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100 dark:border-border/50 bg-muted/5">
        <Filter className="w-3.5 h-3.5 text-foreground" />
        <h2 className="font-bold text-[11px] uppercase tracking-widest text-foreground">
          Additional Filters
        </h2>
      </div>

      <div className="p-3 space-y-4">
        {/* Stops Dropdown */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">
            Stops
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between w-full px-2.5 py-1.5 text-[11px] font-bold border rounded-lg bg-background hover:bg-muted/50 transition-all border-border shadow-sm group">
                <span className="truncate">{stopsLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="start">
              <DropdownMenuLabel className="text-xs">Filter by Stops</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={stops.nonstop}
                onCheckedChange={(v) => setStops((s) => ({ ...s, nonstop: v }))}
                className="text-xs"
              >
                Nonstop
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={stops.oneStop}
                onCheckedChange={(v) => setStops((s) => ({ ...s, oneStop: v }))}
                className="text-xs"
              >
                1 stop
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={stops.twoStops}
                onCheckedChange={(v) =>
                  setStops((s) => ({ ...s, twoStops: v }))
                }
                className="text-xs"
              >
                2+ stops
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="h-px bg-border/40" />

        {/* Amenities */}
        <div className="space-y-3">
          <div>
            <Label className="font-bold text-[11px] uppercase tracking-widest text-foreground">
              Amenities
            </Label>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-bold uppercase tracking-tight opacity-60">
              Bags per passenger
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground/80">Carry-on bag</span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() =>
                    setBags((b) => ({
                      ...b,
                      carryOn: Math.max(0, b.carryOn - 1),
                    }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-bold text-muted-foreground hover:bg-muted/50"
                >
                  -
                </button>
                <span className="w-3 text-center font-bold">
                  {bags.carryOn}
                </span>
                <button
                  onClick={() =>
                    setBags((b) => ({ ...b, carryOn: b.carryOn + 1 }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-bold text-muted-foreground hover:bg-muted/50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground/80">Checked bag</span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() =>
                    setBags((b) => ({
                      ...b,
                      checked: Math.max(0, b.checked - 1),
                    }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-bold text-muted-foreground hover:bg-muted/50"
                >
                  -
                </button>
                <span className="w-3 text-center font-bold">
                  {bags.checked}
                </span>
                <button
                  onClick={() =>
                    setBags((b) => ({ ...b, checked: b.checked + 1 }))
                  }
                  className="w-6 h-6 rounded-md border border-border shadow-sm flex justify-center items-center font-bold text-muted-foreground hover:bg-muted/50"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 dark:border-border/50 bg-muted/5 flex flex-col gap-2">
        <AppIcon
          icon={Filter}
          label="Filter Flights"
          isActive
          className="w-full h-10 rounded-lg text-xs"
          onClick={() => {
            console.log("Filtering flights...");
          }}
        />
        <button className="text-[9px] text-muted-foreground hover:text-foreground transition-colors font-black uppercase tracking-widest text-center">
          Clear all filters
        </button>
      </div>
    </div>
  );
}
