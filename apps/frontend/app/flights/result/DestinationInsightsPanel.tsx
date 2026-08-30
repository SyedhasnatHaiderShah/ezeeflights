"use client";

import React from "react";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Star,
  Sparkles,
  MapPin,
  Compass,
  Camera,
  Utensils,
  Eye,
  Info,
  AlertCircle,
} from "lucide-react";
import { getAirportByCode, Airport } from "@/lib/utils/airport-search";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { useDestinationInsights } from "@/lib/api/destination-insights";
import { normalizeDestinationCode } from "@/lib/store/destination-insights-store";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

import {
  WeatherForecastCard,
  AttractivePlacesCard,
} from "@/components/shared/DestinationInsights";

const GROUPED_SURFACE_CLASS =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

interface DestinationInsightsPanelProps {
  destination: string;
  variant?: "sidebar" | "sheet";
}

export function DestinationInsightsPanel({
  destination,
  variant = "sidebar",
}: DestinationInsightsPanelProps) {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = React.useState(false);
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();

  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];

  const formatPrice = (amount: number) => {
    const converted = getConvertedAmount(amount, "USD", baseCurrency);
    return `${currencyMeta.symbol}${Math.round(converted).toLocaleString("en-US")}`;
  };

  const destCode = normalizeDestinationCode(destination);
  const isGrouped = variant === "sheet";
  const { data: insights, isPending, error } = useDestinationInsights(destCode);
  const showSkeleton =
    !hasMounted || (!insights && destCode.length === 3 && isPending);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  const [airportDetails, setAirportDetails] = React.useState<Airport | null>(
    null,
  );

  React.useEffect(() => {
    getAirportByCode(destination).then((details) => {
      setAirportDetails(details);
    });
  }, [destination]);

  const cityName = React.useMemo(() => {
    if (airportDetails) {
      return airportDetails.municipality || airportDetails.name;
    }
    const destMap: Record<string, string> = {
      LHR: "London",
      DXB: "Dubai",
      LYP: "Faisalabad",
      KHI: "Karachi",
      LHE: "Lahore",
      ISB: "Islamabad",
    };
    return destMap[destination.toUpperCase()] || destination;
  }, [airportDetails, destination]);

  if (!destCode || destCode.length !== 3) {
    return null;
  }

  if (showSkeleton) {
    return (
      <div className="space-y-4 animate-pulse shrink-0">
        <div
          className={cn(
            isGrouped
              ? cn(GROUPED_SURFACE_CLASS, "p-4")
              : "rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm",
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-28 rounded bg-foreground/10" />
            <div className="h-8 w-12 rounded bg-foreground/10" />
          </div>
          <div className="h-12 rounded-[10px] bg-foreground/5 mb-3" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 rounded-[10px] bg-foreground/5" />
            <div className="h-12 rounded-[10px] bg-foreground/5" />
            <div className="h-12 rounded-[10px] bg-foreground/5" />
          </div>
        </div>

        <div
          className={cn(
            isGrouped
              ? cn(GROUPED_SURFACE_CLASS, "p-3 space-y-2")
              : "rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm space-y-2.5",
          )}
        >
          <div className="h-4 w-36 rounded bg-foreground/10 mb-2" />
          <div className="h-14 rounded-[10px] bg-foreground/5" />
          <div className="h-14 rounded-[10px] bg-foreground/5" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "shrink-0 flex items-start gap-2 text-redmix",
          isGrouped
            ? cn(GROUPED_SURFACE_CLASS, "p-3")
            : "rounded-2xl bg-white dark:bg-card border border-redmix/20 p-3 shadow-sm",
        )}
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-foreground leading-tight">
            {t("AI Insights Unavailable")}
          </h4>
          <p className="text-[10px] text-foreground/80 font-semibold mt-1">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <>
      {/* Weather Forecast Block */}
      <section className={cn("shrink-0", isGrouped && "space-y-2")}>
        {isGrouped && (
          <h3 className="px-1 text-[13px] font-semibold text-foreground/80">
            {t("Weather")}
          </h3>
        )}
        <WeatherForecastCard
          cityName={cityName}
          destinationCode={destination}
          condition={insights.weather.condition}
          tempC={insights.weather.tempC}
          highC={insights.weather.highC}
          lowC={insights.weather.lowC}
          humidity={insights.weather.humidity}
          forecast={insights.weather.forecast}
          isGrouped={isGrouped}
        />
      </section>

      {/* Top Attractions / Attractive Places Block */}
      {insights.attractions && insights.attractions.length > 0 && (
        <section className={cn("shrink-0", isGrouped && "space-y-2")}>
          {isGrouped && (
            <h3 className="px-1 text-[13px] font-semibold text-foreground/80">
              {t("Attractive Places")}
            </h3>
          )}
          <AttractivePlacesCard
            attractions={insights.attractions}
            isGrouped={isGrouped}
          />
        </section>
      )}
    </>
  );
}
