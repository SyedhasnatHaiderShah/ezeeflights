"use client";

import React from "react";
import { searchFlights, FlightSearchResponse } from "@/lib/api/flights";
import { useSearchParams } from "next/navigation";
import { Plane, Loader2, ChevronDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { FlightListItem } from "@/lib/types/flight-api";

const GROUPED_SURFACE_CLASS =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

interface Props {
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
  variant?: "sidebar" | "sheet";
}

export function CompactFlightsPanel({
  destination,
  checkInDate: checkInOverride,
  checkOutDate: checkOutOverride,
  variant = "sidebar",
}: Props) {
  const { t } = useTranslation();
  const isGrouped = variant === "sheet";
  const searchParams = useSearchParams();
  const [flights, setFlights] = React.useState<FlightListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Use current date or override
  const depDate =
    checkInOverride || format(addDays(new Date(), 1), "yyyy-MM-dd");

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);

    searchFlights({
      from: "LHE", // Mock origin if we don't have one
      to: destination,
      depDate: depDate,
      adult: 1,
      child: 0,
      infant: 0,
      flightWay: 1, // one way
    })
      .then((res: any) => {
        if (mounted) {
          const fetchedFlights = Array.isArray(res) ? res : (res.data || []);
          setFlights(fetchedFlights.slice(0, 3)); // show top 3 flights
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch flights:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [destination, depDate]);

  if (loading) {
    return (
      <div className={cn(GROUPED_SURFACE_CLASS, "p-4")}>
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-brand-red" />
          <h3 className="text-sm font-bold">{t("Flight Deals")}</h3>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return null;
  }

  return (
    <div className={cn(GROUPED_SURFACE_CLASS, "p-4")}>
      <div className="flex items-center gap-2 mb-3">
        <Plane className="w-4 h-4 text-brand-red" />
        <h3 className="text-sm font-bold">{t("Flight Deals")}</h3>
      </div>
      <div className="space-y-3">
        {flights.map((flight, idx) => (
          <div key={idx} className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span>{flight.outbound?.[0]?.airline?.name || flight.airline?.name || "Airline"}</span>
              <span className="font-bold text-foreground">
                ${flight.totalCost}
              </span>
            </div>
            <div className="text-muted-foreground text-[11px]">
              {flight.outbound?.[0]?.fromAirport?.code} → {flight.outbound?.[flight.outbound.length - 1]?.toAirport?.code}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        <a
          href={`/flights/search?from=LHE&to=${destination}&depDate=${depDate}`}
          className="text-brand-red text-xs font-bold hover:underline"
        >
          {t("See more flights")}
        </a>
      </div>
    </div>
  );
}
