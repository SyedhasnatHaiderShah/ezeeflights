"use client";

import React from "react";
import {
  Sparkles,
  TrendingDown,
  Calendar,
  MessageSquare,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { FlightListItem } from "@/lib/types/flight-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CompactHotelsPanel } from "./CompactHotelsPanel";
import { CompactCarsPanel } from "@/components/cars/CompactCarsPanel";
import { CompactFlightsPanel } from "@/components/flights/CompactFlightsPanel";
import { DestinationInsightsPanel } from "./DestinationInsightsPanel";

interface Props {
  flights: FlightListItem[];
  origin: string;
  destination: string;
  onClose?: () => void;
  variant?: "sidebar" | "sheet";
  domain?: "flights" | "hotels" | "cars";
}

export function FlightAiSuggestionsPanel({
  flights,
  origin,
  destination,
  onClose,
  variant = "sidebar",
  domain = "flights",
}: Props) {
  // Find the "Best Pick" - based on score (price / 5 + duration)
  const bestPick = React.useMemo(() => {
    if (flights.length === 0) return null;
    return [...flights].sort((a, b) => {
      const scoreA = a.totalCost / 5 + a.totalTime;
      const scoreB = b.totalCost / 5 + b.totalTime;
      return scoreA - scoreB;
    })[0];
  }, [flights]);

  // Price analysis
  const priceStatus = React.useMemo(() => {
    if (flights.length === 0) return "neutral";
    const prices = flights.map((f) => f.totalCost);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);

    if (min < avg * 0.8) return "low";
    if (min > avg * 1.2) return "high";
    return "typical";
  }, [flights]);

  const isGrouped = variant === "sheet";

  return (
    <aside
      className={cn(
        "w-full flex flex-col",
        isGrouped ? "gap-3 px-3 pb-4" : "gap-3 p-3 pb-6",
      )}
    >
      <DestinationInsightsPanel destination={destination} variant={variant} />

      {domain === "flights" && (
        <>
          <CompactHotelsPanel destination={destination} variant={variant} />
          <CompactCarsPanel destination={destination} variant={variant} />
        </>
      )}

      {domain === "hotels" && (
        <>
          <CompactCarsPanel destination={destination} variant={variant} />
          <CompactFlightsPanel destination={destination} variant={variant} />
        </>
      )}

      {domain === "cars" && (
        <>
          <CompactHotelsPanel destination={destination} variant={variant} />
          <CompactFlightsPanel destination={destination} variant={variant} />
        </>
      )}
    </aside>
  );
}
