"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Clock, Hourglass } from "lucide-react";

export function DurationFilter() {
  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 bg-brand-dark/[0.02] border-b border-border/50 flex items-center gap-2">
        <Hourglass className="w-3 h-3 text-brand-dark/80" />
        <h3 className="text-xs font-bold text-brand-dark ">Duration</h3>
      </div>

      <div className="p-3 space-y-6">
        {/* Flight leg */}
        <div className="space-y-2">
          <div className="flex flex-col gap-1 px-0.5">
            <Label className="text-xs font-bold text-brand-dark-light/80 ">
              Flight leg
            </Label>
            <span className="text-xs font-bold text-brand-dark leading-none">
              3h 20m - 55h 35m
            </span>
          </div>
          <Slider defaultValue={[10, 80]} max={100} step={1} className="py-1" />
        </div>

        {/* Layover */}
        <div className="space-y-2">
          <div className="flex flex-col gap-1 px-0.5">
            <Label className="text-xs font-bold text-brand-dark-light/80 ">
              Layover
            </Label>
            <span className="text-xs font-bold text-brand-dark leading-none">
              1h 10m - 47h 40m
            </span>
          </div>
          <Slider defaultValue={[0, 60]} max={100} step={1} className="py-1" />
        </div>
      </div>
    </div>
  );
}
