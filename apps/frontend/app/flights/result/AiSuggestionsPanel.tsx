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
import { DestinationInsightsPanel } from "./DestinationInsightsPanel";

interface Props {
  flights: FlightListItem[];
  origin: string;
  destination: string;
  onClose?: () => void;
}

export function AiSuggestionsPanel({
  flights,
  origin,
  destination,
  onClose,
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

  return (
    <aside className="w-full flex flex-col gap-4 p-4 h-full min-h-screen overflow-y-auto bg-slate-50/50 dark:bg-background/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-redmix" />
          <h2 className="text-lg font-bold">EzeeAI Insights</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="md:hidden"
          >
            Close
          </Button>
        )}
      </div>

      {/* Best Pick Section */}
      {/* {bestPick && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-card border border-redmix/20 p-4 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-12 h-12 text-redmix" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-redmix/10 text-redmix text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full">
              Best Overall Pick
            </span>
          </div>
          <h3 className="font-bold text-sm mb-1">
            {bestPick.airline.name} to {destination}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Optimized for both price and duration. A rare balance of efficiency.
          </p>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="text-lg font-black text-redmix">
              ${bestPick.totalCost}
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              {Math.floor(bestPick.totalTime / 60)}h {bestPick.totalTime % 60}m
            </div>
          </div>
        </motion.div>
      )} */}

      {/* Price Insights */}
      {/* <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold">Price Analysis</h3>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden flex">
            <div
              className={cn(
                "h-full",
                priceStatus === "low"
                  ? "w-1/3 bg-emerald-500"
                  : "w-1/3 bg-slate-200 dark:bg-muted-foreground/20",
              )}
            />
            <div
              className={cn(
                "h-full border-x border-white dark:border-card",
                priceStatus === "typical"
                  ? "w-1/3 bg-yellow-500"
                  : "w-1/3 bg-slate-200 dark:bg-muted-foreground/20",
              )}
            />
            <div
              className={cn(
                "h-full",
                priceStatus === "high"
                  ? "w-1/3 bg-redmix"
                  : "w-1/3 bg-slate-200 dark:bg-muted-foreground/20",
              )}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 bg-emerald-500/5 p-3 rounded-xl">
          {priceStatus === "low" ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Prices are currently <span className="font-bold">Low</span> for
                this route. It's a great time to book!
              </p>
            </>
          ) : priceStatus === "high" ? (
            <>
              <AlertCircle className="w-4 h-4 text-redmix mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                Prices are <span className="font-bold">Higher</span> than usual.
                Consider flexible dates.
              </p>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Prices are <span className="font-bold">Typical</span> for this
                route. Consistent value found.
              </p>
            </>
          )}
        </div>
      </div> */}

      {/* Flexible Dates */}
      {/* <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-redmix" />
          <h3 className="text-sm font-bold">Smart Planning</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Flying on a{" "}
          <span className="text-foreground font-semibold">Wednesday</span> could
          save you up to <span className="text-redmix font-bold">$120</span> on
          this route.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 border-redmix/20 text-redmix hover:bg-redmix/5"
        >
          View Price Calendar
        </Button>
      </div> */}

      <DestinationInsightsPanel destination={destination} />

      {/* Ask Ezee Stub */}
      <div className="mt-auto rounded-2xl bg-white p-3 shadow-lg text-foreground">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4" />
          <h3 className="text-sm font-bold">Ask EzeeAI</h3>
        </div>
        <p className="text-xs opacity-90 mb-4 leading-relaxed">
          Need help deciding? Ask me anything about these flights.
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="How's the legroom on..."
            className="w-full bg-white/20 border-none rounded-lg py-2 px-3 text-xs placeholder:text-foreground focus:ring-2 focus:ring-white/50 outline-none"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 bg-white text-redmix hover:bg-white/90"
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
