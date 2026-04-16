"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plane } from "lucide-react";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { FlightListItem } from "@/lib/types/flight-api";

interface Props {
  initialAirlines?: FlightListItem[];
}

export function AirlinesFilter({ initialAirlines = [] }: Props) {
  const { filters, setFilter } = useFlightFilterStore();

  const airlinesList = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; price: string }>();
    initialAirlines.forEach((f) => {
      const code = f.airline.code;
      const name = f.airline.name;
      if (code && name && !map.has(code)) {
        map.set(code, { id: code, name, price: `$${f.totalCost.toLocaleString()}` });
      }
    });
    return Array.from(map.values());
  }, [initialAirlines]);

  const toggleAll = (select: boolean) => {
    if (select) setFilter("airlines", airlinesList.map((a) => a.id));
    else setFilter("airlines", []);
  };

  const toggleOne = (id: string) => {
    const current = filters.airlines;
    if (current.includes(id)) {
      setFilter("airlines", current.filter((a) => a !== id));
    } else {
      setFilter("airlines", [...current, id]);
    }
  };

  return (
    <div className="filter-card">
      <div className="filter-card-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-3 h-3 text-brand-dark/40" />
          <h3 className="filter-card-title">Airlines</h3>
        </div>
      </div>

      <div className="filter-card-body space-y-3">
        <div className="flex items-center justify-between text-xs font-bold  text-brand-dark-light/80 border-b border-border/40 pb-2 mb-0.5">
          <div className="flex gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="hover:text-brand-dark transition-colors cursor-pointer"
            >
              Select all
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="hover:text-brand-dark transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-2.5 px-0.5 max-h-60 overflow-y-auto custom-scrollbar">
          {airlinesList.map((airline) => (
            <div
              key={airline.id}
              className="flex items-center justify-between group cursor-pointer"
              onClick={() => toggleOne(airline.id)}
            >
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id={airline.id}
                  checked={filters.airlines.includes(airline.id)}
                  className="w-3.5 h-3.5 data-[state=checked]:bg-brand-dark data-[state=checked]:border-brand-dark transition-colors"
                />
                <Label
                  htmlFor={airline.id}
                  className="text-xs font-semibold text-brand-dark-light/80 group-hover:text-brand-dark transition-colors cursor-pointer"
                >
                  {airline.name}
                </Label>
              </div>
              {airline.price && (
                <span className="text-xs font-bold text-brand-dark-light/70">
                  {airline.price}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
