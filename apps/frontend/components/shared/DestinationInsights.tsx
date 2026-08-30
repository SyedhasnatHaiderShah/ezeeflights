"use client";

import React from "react";
import { Thermometer, Droplets, Star, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WeatherForecastCardProps {
  cityName: string;
  destinationCode: string;
  condition: string;
  tempC: number;
  highC: number;
  lowC: number;
  humidity: number;
  forecast: Array<{ day: string; icon: string; highC: number; lowC: number }>;
  isGrouped?: boolean;
}

export function WeatherForecastCard({
  cityName,
  destinationCode,
  condition,
  tempC,
  highC,
  lowC,
  humidity,
  forecast,
  isGrouped = false,
}: WeatherForecastCardProps) {
  const { t } = useTranslation();
  const resolvedCityName = cityName;
  const insights = {
    weather: {
      condition,
      tempC,
      highC,
      lowC,
      humidity,
      forecast,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm"
    >
      {/* <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-redmix" />
          <h3 className="text-sm font-bold">{t("Stay weather")}</h3>
        </div>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-redmix" /> AI
        </span>
      </div> */}
      <div className="rounded-xl bg-muted/15 border border-border/50 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold capitalize">{resolvedCityName}</p>
            <p className="text-xs text-foreground tracking-wider font-semibold">
              {t(insights.weather.condition)}
            </p>
          </div>
          <p className="text-xl font-black text-redmix dark:text-white">
            {insights.weather.tempC}
            <span className="text-xs font-bold">°C</span>
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap gap-3 text-xs font-semibold text-foreground/80">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-redmix dark:text-white" />H{" "}
            {insights.weather.highC}° / L {insights.weather.lowC}°
          </span>
          <span className="inline-flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            {insights.weather.humidity}% {t("humidity")}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {insights.weather.forecast.map((day) => (
          <div
            key={day.day}
            className="rounded-lg border border-border/50 bg-muted/10 px-2 py-1.5 text-center"
          >
            <p className="text-xs font-semibold text-foreground">
              {t(day.day)}
            </p>
            <p className="text-base my-1">{day.icon}</p>
            <p className="text-xs font-semibold">
              {day.highC}°/{day.lowC}°
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

interface Attraction {
  name: string;
  category: string;
  rating: number;
  fromPrice: number;
}

interface AttractivePlacesCardProps {
  attractions: Attraction[];
  isGrouped?: boolean;
}

export function AttractivePlacesCard({
  attractions,
  isGrouped = false,
}: AttractivePlacesCardProps) {
  const { t } = useTranslation();
  const insights = {
    attractions,
  };

  if (!attractions || attractions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-4 h-4 text-redmix dark:text-white" />
        <h3 className="text-sm font-bold">{t("Explore near your hotel")}</h3>
      </div>
      <div className="space-y-2">
        {insights.attractions.slice(0, 4).map((attr) => (
          <div
            key={attr.name}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2"
          >
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">{attr.name}</p>
              <p className="text-xs font-medium text-foreground">
                {t(attr.category)}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 shrink-0">
              ★ {attr.rating.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
