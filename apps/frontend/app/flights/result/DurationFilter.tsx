"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Clock, Hourglass } from "lucide-react";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";

export function DurationFilter() {
  const { filters, setFilter } = useFlightFilterStore();

  const handleDurationChange = (value: number[]) => {
    setFilter("durationRange", value as [number, number]);
  };

  const handleLayoverChange = (value: number[]) => {
    setFilter("layoverRange", value as [number, number]);
  };

  const formatDuration = (value: number) => {
    const totalMinutes = (value / 100) * 4000; // Assuming 4000 min max for now
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="filter-card">
      <div className="filter-card-header flex items-center gap-2">
        <Hourglass className="w-3 h-3 text-brand-dark/80" />
        <h3 className="filter-card-title">Duration</h3>
      </div>

      <div className="filter-card-body space-y-6">
        {/* Flight leg */}
        <div className="space-y-2">
          <div className="flex flex-col gap-1 px-0.5">
            <Label className="text-xs font-bold text-brand-dark-light/80 ">
              Flight leg
            </Label>
            <span className="text-xs font-bold text-brand-dark leading-none">
              {formatDuration(filters.durationRange[0])} -{" "}
              {formatDuration(filters.durationRange[1])}
            </span>
          </div>
          <Slider
            value={filters.durationRange}
            max={100}
            step={1}
            onValueChange={handleDurationChange}
            className="py-1"
          />
        </div>

        {/* Layover */}
        <div className="space-y-2">
          <div className="flex flex-col gap-1 px-0.5">
            <Label className="text-xs font-bold text-brand-dark-light/80 ">
              Layover
            </Label>
            <span className="text-xs font-bold text-brand-dark leading-none">
              {formatDuration(filters.layoverRange[0])} -{" "}
              {formatDuration(filters.layoverRange[1])}
            </span>
          </div>
          <Slider
            value={filters.layoverRange}
            max={100}
            step={1}
            onValueChange={handleLayoverChange}
            className="py-1"
          />
        </div>
      </div>
    </div>
  );
}
