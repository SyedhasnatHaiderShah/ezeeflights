"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function QuickFilters() {
  return (
    <div className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border shadow-sm overflow-hidden">
      <div className="p-3 space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-0.5">
            <Label htmlFor="basic-tickets" className="text-[11px] font-bold cursor-pointer uppercase tracking-tight">
              Hide basic tickets
            </Label>
            <p className="text-[10px] text-muted-foreground font-medium leading-tight">
              Options with seat & carry-on bag.
            </p>
          </div>
          <Switch id="basic-tickets" className="scale-75 origin-right" />
        </div>

        <div className="h-px bg-border/40" />

        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-0.5">
            <Label htmlFor="book-kayak" className="text-[11px] font-bold cursor-pointer uppercase tracking-tight">
              Book on KAYAK
            </Label>
            <p className="text-[10px] text-muted-foreground font-medium leading-tight">
              Instantly bookable on KAYAK.
            </p>
          </div>
          <Switch id="book-kayak" className="scale-75 origin-right" />
        </div>
      </div>
    </div>
  );
}
