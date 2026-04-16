"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";

export function QuickFilters() {
  const { filters, setFilter } = useFlightFilterStore();

  return (
    <div className="filter-card">
      <div className="filter-card-body space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-0.5">
            <Label
              htmlFor="basic-tickets"
              className="text-xs font-semibold cursor-pointer text-brand-dark"
            >
              Hide basic tickets
            </Label>
            <p className="text-xs text-brand-dark-light/40 font-medium  leading-tight">
              Options with seat & carry-on bag.
            </p>
          </div>
          <Switch
            id="basic-tickets"
            className="scale-75 origin-right cursor-pointer"
            checked={filters.hideBasicTickets}
            onCheckedChange={(v) => setFilter("hideBasicTickets", v)}
          />
        </div>

        <div className="h-px bg-border/40" />

        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-0.5">
            <Label
              htmlFor="book-kayak"
              className="text-xs font-semibold cursor-pointer text-brand-dark"
            >
              Book on KAYAK
            </Label>
            <p className="text-xs text-brand-dark-light/40 font-medium  leading-tight">
              Instantly bookable on website.
            </p>
          </div>
          <Switch
            id="book-kayak"
            className="scale-75 origin-right cursor-pointer"
            checked={filters.bookOnKayak}
            onCheckedChange={(v) => setFilter("bookOnKayak", v)}
          />
        </div>
      </div>
    </div>
  );
}
