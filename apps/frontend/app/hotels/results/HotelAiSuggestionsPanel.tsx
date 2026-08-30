"use client";

import React from "react";
import {
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Info,
  CloudSun,
  Thermometer,
  Droplets,
  Building2,
  MapPin,
  Star,
  BedDouble,
} from "lucide-react";
import { motion } from "framer-motion";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Hotel } from "@/lib/api/hotels";
import { apiFetch } from "@/lib/api/client";
import { CompactCarsPanel } from "@/components/cars/CompactCarsPanel";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { useTranslation } from "react-i18next";
import { fetchAirports } from "@/lib/utils/airport-search";
import { WeatherForecastCard, AttractivePlacesCard } from "@/components/shared/DestinationInsights";

type HotelInsight = {
  name: string;
  area: string;
  rating: number;
  fromPrice: number;
  highlight: string;
};

type DestinationInsightsData = {
  weather: {
    condition: string;
    tempC: number;
    highC: number;
    lowC: number;
    humidity: number;
    forecast: Array<{ day: string; icon: string; highC: number; lowC: number }>;
  };
  hotels?: HotelInsight[];
  attractions?: Array<{
    name: string;
    category: string;
    rating: number;
    fromPrice: number;
  }>;
};

const hotelInsightsCache: Record<string, DestinationInsightsData> = {};

export async function preFetchHotelInsights(city: string) {
  const key = city.trim();
  if (!key || hotelInsightsCache[key]) return;
  try {
    const resData = await apiFetch<{
      success: boolean;
      data?: DestinationInsightsData;
    }>(
      `/ai/destination-insights?destination=${encodeURIComponent(key)}`,
      undefined,
      { suppressErrorLog: true },
    );
    if (resData.success && resData.data) {
      hotelInsightsCache[key] = resData.data;
    }
  } catch {
    // ignore prefetch errors
  }
}

interface Props {
  hotels: Hotel[];
  city: string;
  onClose?: () => void;
}

export function HotelAiSuggestionsPanel({ hotels, city, onClose }: Props) {
  const { t } = useTranslation();
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES.USD;

  const [insights, setInsights] =
    React.useState<DestinationInsightsData | null>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(true);
  const [insightsError, setInsightsError] = React.useState<string | null>(null);

  const cityKey = city.trim();
  const [resolvedCityName, setResolvedCityName] = React.useState(cityKey);

  React.useEffect(() => {
    if (!cityKey) return;
    if (cityKey.length === 3) {
      fetchAirports()
        .then((airports) => {
          const match = airports.find(
            (a) => a.iata_code?.toUpperCase() === cityKey.toUpperCase(),
          );
          if (match) {
            const resolved =
              match.municipality ||
              match.name.replace(/\s*(Airport|International Airport)$/i, "") ||
              match.name;
            setResolvedCityName(resolved);
          }
        })
        .catch(() => {});
    }
  }, [cityKey]);

  React.useEffect(() => {
    if (!cityKey) {
      setLoadingInsights(false);
      return;
    }

    const cached = hotelInsightsCache[cityKey];
    if (cached) {
      setInsights(cached);
      setLoadingInsights(false);
      setInsightsError(null);
      return;
    }

    let active = true;
    setLoadingInsights(true);
    setInsightsError(null);

    apiFetch<{
      success: boolean;
      data?: DestinationInsightsData;
      error?: string;
      message?: string;
    }>(
      `/ai/destination-insights?destination=${encodeURIComponent(cityKey)}`,
      undefined,
      { suppressErrorLog: true },
    )
      .then((resData) => {
        if (!active) return;
        if (resData.success && resData.data) {
          hotelInsightsCache[cityKey] = resData.data;
          setInsights(resData.data);
          setInsightsError(null);
        } else {
          setInsights(null);
          setInsightsError(resData.error || "Failed to load insights");
        }
        setLoadingInsights(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setInsights(null);
        setInsightsError(err.message || "Failed to load insights");
        setLoadingInsights(false);
      });

    return () => {
      active = false;
    };
  }, [cityKey]);

  const bestValue = React.useMemo(() => {
    if (hotels.length === 0) return null;
    return [...hotels].sort((a, b) => {
      const scoreA = (a.minPricePerNight || 1000) / (a.userRating || 1);
      const scoreB = (b.minPricePerNight || 1000) / (b.userRating || 1);
      return scoreA - scoreB;
    })[0];
  }, [hotels]);

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

  const topAreas = React.useMemo(() => {
    const areas = new Map<string, number>();
    hotels.forEach((h) => {
      const area = h.city || h.address?.split(",")[0]?.trim();
      if (area) areas.set(area, (areas.get(area) || 0) + 1);
    });
    return [...areas.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
  }, [hotels]);

  const formatUsdPrice = (amount: number) => {
    const converted = getConvertedAmount(amount, "USD", baseCurrency);
    return `${currencyMeta.symbol}${Math.round(converted).toLocaleString("en-US")}`;
  };

  return (
    <aside className="w-full flex flex-col gap-4 p-4 pb-8">
      {/* <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-redmix/10">
            <Sparkles className="w-4 h-4 text-redmix" />
          </span>
          <h2 className="text-lg font-bold tracking-tight">
            {t("Hotel Insights")}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden rounded-full bg-muted/70 px-3.5 py-1.5 text-[13px] font-semibold text-foreground active:scale-95 transition-transform"
          >
            {t("Close")}
          </button>
        )}
      </div> */}

      {/* <p className="text-xs font-semibold text-muted-foreground -mt-2">
        {t("AI tips for stays in")}{" "}
        <span className="text-foreground font-bold capitalize">{cityKey}</span>
      </p> */}

      {/* AI destination insights — loads on mount by city */}
      {loadingInsights ? (
        <div className="space-y-3 animate-pulse">
          <div className="rounded-2xl border border-border bg-card p-4 h-28" />
          <div className="rounded-2xl border border-border bg-card p-4 h-36" />
        </div>
      ) : insightsError ? (
        <div className="rounded-2xl border border-redmix/20 bg-card p-3 flex items-start gap-2 text-redmix">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold">{t("AI insights unavailable")}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {insightsError}
            </p>
          </div>
        </div>
      ) : insights ? (
        <>
          {/* Weather — useful when choosing a hotel */}
          <WeatherForecastCard
            cityName={resolvedCityName}
            destinationCode={cityKey}
            condition={insights.weather.condition}
            tempC={insights.weather.tempC}
            highC={insights.weather.highC}
            lowC={insights.weather.lowC}
            humidity={insights.weather.humidity}
            forecast={insights.weather.forecast}
            isGrouped={false}
          />

          <CompactCarsPanel destination={city} />

          {/* AI recommended hotels & areas */}
          {insights.hotels && insights.hotels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <BedDouble className="w-4 h-4 text-redmix" />
                <h3 className="text-sm font-bold">
                  {t("Where to stay in")} {cityKey}
                </h3>
              </div>
              <div className="space-y-2.5">
                {insights.hotels.map((hotel) => (
                  <div
                    key={`${hotel.name}-${hotel.area}`}
                    className="rounded-xl border border-border/50 bg-muted/10 p-3 hover:border-redmix/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {hotel.name}
                        </p>
                        <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-redmix shrink-0" />
                          {hotel.area}
                        </p>
                        <p className="text-[10px] text-foreground/70 mt-1.5">
                          {hotel.highlight}
                        </p>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          {hotel.rating.toFixed(1)}
                        </div>
                        <p className="text-xs font-black text-redmix">
                          {t("from")} {formatUsdPrice(hotel.fromPrice)}
                          <span className="text-[9px] font-semibold text-muted-foreground">
                            /{t("night")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Near your hotel — attractions */}
          {insights.attractions && insights.attractions.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
              <AttractivePlacesCard
                attractions={insights.attractions}
                isGrouped={false}
              />
            </div>
          )}
        </>
      ) : null}

      {/* From your search results */}
      {/* {topAreas.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-redmix" />
            <h3 className="text-sm font-bold">{t("Popular in this search")}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topAreas.map(({ name, count }) => (
              <span
                key={name}
                className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-redmix/10 text-redmix border border-redmix/20"
              >
                {name} · {count} {count === 1 ? t("hotel") : t("hotels")}
              </span>
            ))}
          </div>
        </div>
      )} */}

      {/* {bestValue && (
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
              {t("Best value in results")}
            </span>
          </div>
          <h3 className="font-bold text-sm mb-1 truncate">{bestValue.name}</h3>
          <p className="text-xs text-muted-foreground mb-4">
            {t("Top rated vs. price among")} {hotels.length}{" "}
            {t("properties in")} {city}.
          </p>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <CurrencyDisplay
              amount={bestValue.minPricePerNight || 0}
              currency={bestValue.currency || "USD"}
              bypassConversion={bestValue.id.startsWith("ht-")}
              amountClassName="text-lg font-black text-redmix"
              showComparison={false}
            />
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">
              {t("per night")}
            </p>
            <div className="text-xs font-semibold text-muted-foreground">
              {(bestValue.userRating || 0).toFixed(1)} / 5.0
            </div>
          </div>
        </motion.div>
      )} */}

      {/* <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold">{t("Rates in")} {city}</h3>
        </div>
        <div className="flex items-start gap-2 bg-emerald-500/5 p-3 rounded-xl">
          {priceStatus === "low" ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                {t("Hotel rates are")} <span className="font-bold">{t("lower")}</span> {t("than usual in")} {city}. {t("Good time to book a stay.")}
              </p>
            </>
          ) : priceStatus === "high" ? (
            <>
              <AlertCircle className="w-4 h-4 text-redmix mt-0.5 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                {t("Rates are")} <span className="font-bold">{t("higher")}</span> {t("— consider booking early or flexible dates.")}
              </p>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                {t("Typical seasonal rates. Compare areas and star ratings before you book.")}
              </p>
            </>
          )}
        </div>
      </div> */}
    </aside>
  );
}
