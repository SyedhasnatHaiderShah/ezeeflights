"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";

export function TimeFilter() {
  const { filters, setFilter } = useFlightFilterStore();

  const handleTakeoffChange = (value: number[]) => {
    setFilter("takeoffRange", value as [number, number]);
  };

  const handleLandingChange = (value: number[]) => {
    setFilter("landingRange", value as [number, number]);
  };

  const formatTime = (value: number) => {
    const totalMinutes = (value / 100) * 1440;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 bg-brand-dark/[0.02] border-b border-border/50 flex items-center gap-2">
        <Clock className="w-3 h-3 text-brand-dark/80" />
        <h3 className="text-xs font-bold text-brand-dark ">Times</h3>
      </div>
      <div className="p-3">
        <Tabs defaultValue="take-off" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-8 bg-muted/20 p-0.5 rounded-lg">
            <TabsTrigger
              value="take-off"
              className="text-xs font-bold  h-7 data-[state=active]:bg-white data-[state=active]:text-redmix data-[state=active]:shadow-sm transition-all cursor-pointer"
            >
              Take-off
            </TabsTrigger>
            <TabsTrigger
              value="landing"
              className="text-xs font-bold  h-7 data-[state=active]:bg-white data-[state=active]:text-redmix data-[state=active]:shadow-sm transition-all cursor-pointer"
            >
              Landing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="take-off" className="space-y-4 outline-none">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-brand-dark-light/80 ">
                  Take-off range
                </span>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-xs font-semibold text-brand-dark leading-none">
                    {formatTime(filters.takeoffRange[0])}
                  </span>
                  <span className="text-xs font-semibold text-brand-dark leading-none">
                    {formatTime(filters.takeoffRange[1])}
                  </span>
                </div>
              </div>
              <Slider
                value={filters.takeoffRange}
                max={100}
                step={1}
                onValueChange={handleTakeoffChange}
                className="py-1"
              />
            </div>
          </TabsContent>

          <TabsContent value="landing" className="space-y-4 outline-none">
            <div className="w-full space-y-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-brand-dark-light/80 ">
                  Landing range
                </span>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-xs font-semibold text-brand-dark leading-none">
                    {formatTime(filters.landingRange[0])}
                  </span>
                  <span className="text-xs font-semibold text-brand-dark leading-none">
                    {formatTime(filters.landingRange[1])}
                  </span>
                </div>
              </div>
              <Slider
                value={filters.landingRange}
                max={100}
                step={1}
                onValueChange={handleLandingChange}
                className="py-1"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
