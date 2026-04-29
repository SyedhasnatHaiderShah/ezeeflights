"use client";

import React from "react";
import {
  Sparkles,
  TrendingDown,
  MessageSquare,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DestinationInsightsPanel } from "../../flights/result/DestinationInsightsPanel";

import { Hotel } from "@/lib/api/hotels";

interface Props {
  hotels: Hotel[];
  city: string;
  onClose?: () => void;
}

export function HotelAiSuggestionsPanel({ hotels, city, onClose }: Props) {
  // Find the "Best Value" hotel
  const bestValue = React.useMemo(() => {
    if (hotels.length === 0) return null;
    return [...hotels].sort((a, b) => {
      // Score: lower price and higher rating is better
      const scoreA = (a.minPricePerNight || 1000) / (a.userRating || 1);
      const scoreB = (b.minPricePerNight || 1000) / (b.userRating || 1);
      return scoreA - scoreB;
    })[0];
  }, [hotels]);

  // Price analysis
  const priceStatus = React.useMemo(() => {
    if (hotels.length === 0) return "typical";
    const prices = hotels
      .map((h) => h.minPricePerNight || 0)
      .filter((p) => p > 0);
    if (prices.length === 0) return "typical";
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);

    if (min < avg * 0.7) return "low";
    if (min > avg * 1.3) return "high";
    return "typical";
  }, [hotels]);

  return (
    <aside className="w-full flex flex-col gap-4 p-4 h-full overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-redmix" />
          <h2 className="text-lg font-bold">Hotel Insights</h2>
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

      {/* Best Value Section */}
      {bestValue && (
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
              Best Value Pick
            </span>
          </div>
          <h3 className="font-bold text-sm mb-1 truncate">{bestValue.name}</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Highly rated and competitively priced compared to others in {city}.
          </p>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="text-lg font-black text-redmix">
              ${bestValue.minPricePerNight}
            </div>
            <div className="text-xs font-semibold text-muted-foreground">
              {bestValue.userRating || 0} / 5.0 Rating
            </div>
          </div>
        </motion.div>
      )}

      {/* Price Insights */}
      <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold">Market Analysis</h3>
        </div>

        <div className="flex items-start gap-2 bg-emerald-500/5 p-3 rounded-xl">
          {priceStatus === "low" ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Hotel rates are <span className="font-bold">Lower</span> than
                usual in {city}. Excellent time to stay!
              </p>
            </>
          ) : priceStatus === "high" ? (
            <>
              <AlertCircle className="w-4 h-4 text-redmix mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                Rates are <span className="font-bold">Higher</span> due to peak
                season or local events.
              </p>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                Standard seasonal rates detected. Many options available within
                typical budgets.
              </p>
            </>
          )}
        </div>
      </div>

      <DestinationInsightsPanel destination={city} />

      {/* Ask Ezee AI */}
      <div className="mt-auto rounded-2xl bg-slate-900 p-3 shadow-lg text-white">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4" />
          <h3 className="text-sm font-bold">Ask EzeeAI</h3>
        </div>
        <p className="text-xs opacity-90 mb-4 leading-relaxed">
          Which hotel has the best pool or breakfast? I can help you decide.
        </p>
        <div className="relative">
          <input
            type="text"
            placeholder="Suggest a family hotel..."
            className="w-full bg-white/20 border-none rounded-lg py-2 px-3 text-xs placeholder:text-white/60 focus:ring-2 focus:ring-white/50 outline-none"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 bg-white text-slate-900 hover:bg-white/90"
          >
            <Sparkles className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
