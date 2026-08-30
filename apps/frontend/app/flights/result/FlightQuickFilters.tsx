"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

import { useFlightFilterStore } from "@/lib/store/flight-filter-store";

export function FlightQuickFilters() {
  const { t } = useTranslation();
  const { filters, setFilter } = useFlightFilterStore();

  return (
    <div className="filter-card">
      <div className="filter-card-body space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-0.5">
            <Label
              htmlFor="basic-tickets"
              className="text-xs font-semibold cursor-pointer text-foreground"
            >
              {t("Hide basic tickets")}
            </Label>
            <p className="text-xs text-muted-foreground font-medium leading-tight">
              {t("Options with seat & carry-on bag.")}
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
              className="text-xs font-semibold cursor-pointer text-foreground"
            >
              {t("Book on KAYAK")}
            </Label>
            <p className="text-xs text-muted-foreground font-medium leading-tight">
              {t("Instantly bookable on website.")}
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
