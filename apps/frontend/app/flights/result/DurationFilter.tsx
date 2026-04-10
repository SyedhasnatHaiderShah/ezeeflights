"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Clock, Hourglass } from "lucide-react";

export function DurationFilter() {
  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 bg-muted/5 border-b border-border/50 flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-foreground" />
        <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">
          Duration
        </h3>
      </div>

      <div className="p-3 space-y-6">
        {/* Flight leg */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-0.5">
            <Label className="text-[10px] font-black uppercase">
              Flight leg
            </Label>
            <span className="text-[10px] font-bold text-muted-foreground/70">
              3h 20m - 55h 35m
            </span>
          </div>
          <Slider defaultValue={[10, 80]} max={100} step={1} className="py-1" />
        </div>

        {/* Layover */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-0.5">
            <Label className="text-[10px] font-black uppercase">Layover</Label>
            <span className="text-[10px] font-bold text-muted-foreground/70">
              1h 10m - 47h 40m
            </span>
          </div>
          <Slider defaultValue={[0, 60]} max={100} step={1} className="py-1" />
        </div>
      </div>
    </div>
  );
}
