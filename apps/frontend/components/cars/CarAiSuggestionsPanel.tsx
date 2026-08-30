"use client";

import React from "react";
import { format } from "date-fns";
import { Car, Loader2, MapPin, Sparkles } from "lucide-react";
import { CompactHotelsPanel } from "@/app/flights/result/CompactHotelsPanel";
import { CompactFlightsPanel } from "@/components/flights/CompactFlightsPanel";
import { getAirportByCode, Airport } from "@/lib/utils/airport-search";
import { useDestinationInsights } from "@/lib/api/destination-insights";
import {
  WeatherForecastCard,
  AttractivePlacesCard,
} from "@/components/shared/DestinationInsights";
import { beginDestinationInsightsSearch } from "@/lib/api/destination-insights";
import { useResolvedDestinationCode } from "@/lib/hooks/use-resolved-destination-code";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Props {
  pickup: string;
  dropoff?: string;
  pickupDate?: Date | string;
  dropoffDate?: Date | string;
  /** Hide related hotels (e.g. compact strip under edit search) */
  showHotels?: boolean;
  className?: string;
  warnings?: string[];
}

function toDateString(value?: Date | string): string | undefined {
  if (!value) return undefined;
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return format(d, "yyyy-MM-dd");
  } catch {
    return undefined;
  }
}

function simplifyWarning(warning: string): string {
  const vendorNames: Record<string, string> = {
    ZE: "Hertz",
    ZI: "Avis",
    SX: "Sixt",
    ET: "Enterprise",
    ZL: "National",
    AL: "Alamo",
    FX: "Fox Rent A Car",
    ZA: "Payless",
    ZD: "Budget",
    ZT: "Thrifty",
  };

  // Find vendor code (e.g. ZE, ET, etc.)
  const vendorMatch =
    warning.match(/VENDOR(?: LOCATION)?\s+([A-Z2-9]{2})/i) ||
    warning.match(/FOR VENDOR\s+([A-Z2-9]{2})/i);
  const vendorCode = vendorMatch ? vendorMatch[1].toUpperCase() : "";
  const vendorName = vendorNames[vendorCode] || vendorCode || "Vendor";

  const lowerWarning = warning.toLowerCase();

  if (lowerWarning.includes("thank you for choosing")) {
    return "";
  }

  // 1. Min age & under 25 surcharges
  if (
    lowerWarning.includes("min age") ||
    lowerWarning.includes("under 25") ||
    lowerWarning.includes("age")
  ) {
    if (
      lowerWarning.includes("min age") &&
      lowerWarning.includes("rate differential")
    ) {
      const ageMatch = warning.match(/MIN AGE (\d+)/i);
      const minAge = ageMatch ? ageMatch[1] : "18";
      return `${vendorName}: Minimum age is ${minAge}. A surcharge applies for drivers aged ${minAge}-24.`;
    }
    if (lowerWarning.includes("under 25")) {
      return `${vendorName}: Special rules or surcharges apply for drivers under 25 years old.`;
    }
    return `${vendorName}: Special driver age policies apply.`;
  }

  // 2. No rates found
  if (
    lowerWarning.includes("no rates") ||
    lowerWarning.includes("no rate could be found")
  ) {
    return `${vendorName}: No rates or availability found for the selected options.`;
  }

  // 3. Fallback: clean raw status codes
  const cleaned = warning
    .replace(/^\s*\d+\s+/, "") // remove code prefix (e.g. "34 ", "26 ")
    .replace(/^00\s+U\s+/, "") // remove "00 U "
    .replace(/AT VENDOR LOCATION.*$/i, "") // strip trailing location
    .trim();

  return `${vendorName}: ${cleaned}`;
}

export function CarAiSuggestionsPanel({
  pickup,
  dropoff,
  pickupDate,
  dropoffDate,
  showHotels = false,
  className,
  warnings,
}: Props) {
  const { t } = useTranslation();
  const [showAllWarnings, setShowAllWarnings] = React.useState(false);
  const filteredWarnings = React.useMemo(() => {
    return (warnings || []).map(simplifyWarning).filter(Boolean);
  }, [warnings]);
  const { code: pickupCode, isResolving: resolvingPickup } =
    useResolvedDestinationCode(pickup);
  const { code: dropoffCode, isResolving: resolvingDropoff } =
    useResolvedDestinationCode(dropoff || pickup);

  const hotelDestination = dropoffCode.length === 3 ? dropoffCode : pickupCode;

  const checkIn = toDateString(pickupDate);
  const checkOut = toDateString(dropoffDate);

  React.useEffect(() => {
    if (pickupCode.length === 3) {
      beginDestinationInsightsSearch(pickupCode);
    }
    if (dropoffCode.length === 3 && dropoffCode !== pickupCode) {
      beginDestinationInsightsSearch(dropoffCode);
    }
  }, [pickupCode, dropoffCode]);

  const {
    data: insights,
    isPending: loadingInsights,
    error: insightsError,
  } = useDestinationInsights(pickupCode);

  const [airportDetails, setAirportDetails] = React.useState<Airport | null>(
    null,
  );
  React.useEffect(() => {
    if (pickupCode.length === 3) {
      getAirportByCode(pickupCode).then((details) => {
        setAirportDetails(details);
      });
    }
  }, [pickupCode]);

  const resolvedCityName = React.useMemo(() => {
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
    return destMap[pickupCode.toUpperCase()] || pickupCode;
  }, [airportDetails, pickupCode]);

  const isResolving = resolvingPickup || resolvingDropoff;

  if (isResolving) {
    return (
      <div
        className={cn(
          "w-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-6 text-center shrink-0",
          className,
        )}
      >
        <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {t("Loading destination insights...")}
        </p>
      </div>
    );
  }

  if (pickupCode.length !== 3) {
    return (
      <div
        className={cn(
          "w-full rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-center shrink-0",
          className,
        )}
      >
        <MapPin className="mx-auto h-5 w-5 text-muted-foreground mb-2" />
        <p className="text-xs font-semibold text-muted-foreground">
          {t(
            "Select an airport or city to see AI travel insights for your rental.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {filteredWarnings.length > 0 && (
        <div className="p-3 rounded-md bg-background border border-redmix/20 text-foreground">
          <p className="text-xs font-bold tracking-wider mb-2 border-b border-redmix/20 pb-1 flex items-center gap-1">
            <span className="font-bold">⚠️</span>{" "}
            {t("Important Policies / Rules")}
          </p>
          <div className="space-y-1">
            {(showAllWarnings
              ? filteredWarnings
              : filteredWarnings.slice(0, 1)
            ).map((warning: string, idx: number) => (
              <p key={idx} className="text-xs font-medium capitalize">
                • {t(warning)}
              </p>
            ))}
          </div>
          {filteredWarnings.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllWarnings(!showAllWarnings)}
              className="mt-2 text-xs font-semibold text-redmix capitalize hover:underline flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              {showAllWarnings
                ? t("See less")
                : `${t("See more")} (+${filteredWarnings.length - 1} ${t("more")})`}
            </button>
          )}
        </div>
      )}

      {loadingInsights ? (
        <div className="space-y-3 animate-pulse">
          <div className="rounded-2xl border border-border bg-card p-4 h-28" />
          <div className="rounded-2xl border border-border bg-card p-4 h-36" />
        </div>
      ) : insightsError ? (
        <div className="rounded-2xl border border-redmix/20 bg-card p-3 flex items-start gap-2 text-redmix">
          <p className="text-xs font-bold">{t("AI insights unavailable")}</p>
        </div>
      ) : insights ? (
        <>
          <WeatherForecastCard
            cityName={resolvedCityName}
            destinationCode={pickupCode}
            condition={insights.weather.condition}
            tempC={insights.weather.tempC}
            highC={insights.weather.highC}
            lowC={insights.weather.lowC}
            humidity={insights.weather.humidity}
            forecast={insights.weather.forecast}
            isGrouped={false}
          />
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

      <CompactFlightsPanel
        destination={hotelDestination}
        checkInDate={checkIn}
        checkOutDate={checkOut}
      />
      {showHotels && hotelDestination.length === 3 && (
        <CompactHotelsPanel
          destination={hotelDestination}
          checkInDate={checkIn}
          checkOutDate={checkOut}
        />
      )}
    </div>
  );
}
