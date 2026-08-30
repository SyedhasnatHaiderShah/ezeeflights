"use client";

import React from "react";
import { searchCars } from "@/lib/api/cars";
import { CompactCarCard } from "./CompactCarCard";
import { useSearchParams } from "next/navigation";
import { Car as CarIcon, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const GROUPED_SURFACE_CLASS =
  "overflow-hidden rounded-[12px] p-3 bg-white dark:bg-card border border-border/50 shadow-sm";

interface Props {
  destination: string;
  pickupDate?: string;
  dropoffDate?: string;
  variant?: "sidebar" | "sheet";
}

export function CompactCarsPanel({
  destination,
  pickupDate: pickupOverride,
  dropoffDate: dropoffOverride,
  variant = "sidebar",
}: Props) {
  const { t } = useTranslation();
  const isGrouped = variant === "sheet";
  const searchParams = useSearchParams();
  const [cars, setCars] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Read date parameters from URL (or fallbacks)
  const dDateParam = searchParams.get("dDate") || searchParams.get("checkInDate") || searchParams.get("checkIn");
  const rDateParam = searchParams.get("rDate") || searchParams.get("checkOutDate") || searchParams.get("checkOut");
  const pickupDateParam =
    searchParams.get("pickupDate") || searchParams.get("pickup_date");
  const dropoffDateParam =
    searchParams.get("dropoffDate") || searchParams.get("dropoff_date");

  const formatParamDate = (param: string | null) => {
    if (!param) return undefined;
    try {
      const d = new Date(param);
      if (Number.isNaN(d.getTime())) return undefined;
      return format(d, "yyyy-MM-dd");
    } catch {
      return undefined;
    }
  };

  const flightDepartFormatted = formatParamDate(dDateParam);
  const flightReturnFormatted = formatParamDate(rDateParam);

  const pickupDate =
    pickupOverride ||
    pickupDateParam ||
    flightDepartFormatted ||
    format(addDays(new Date(), 1), "yyyy-MM-dd");

  let dropoffDate =
    dropoffOverride ||
    dropoffDateParam ||
    format(addDays(new Date(pickupDate), 1), "yyyy-MM-dd");

  if (dropoffDate <= pickupDate) {
    try {
      const pickupParsed = new Date(pickupDate);
      if (!Number.isNaN(pickupParsed.getTime())) {
        dropoffDate = format(addDays(pickupParsed, 1), "yyyy-MM-dd");
      } else {
        dropoffDate = format(addDays(new Date(), 2), "yyyy-MM-dd");
      }
    } catch {
      dropoffDate = format(addDays(new Date(), 2), "yyyy-MM-dd");
    }
  }

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);

    searchCars({
      pickup_location: destination,
      dropoff_location: destination,
      pickup_date: pickupDate,
      dropoff_date: dropoffDate,
    })
      .then((res: any) => {
        if (mounted) {
          const carsData = Array.isArray(res) ? res : res.data || [];
          setCars(carsData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch cars for suggestions:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [destination, pickupDate, dropoffDate]);

  const [showArrow, setShowArrow] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight;
    const reachedBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setShowArrow(isScrollable && !reachedBottom);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [cars, checkScroll]);

  if (loading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-10 shrink-0",
          isGrouped
            ? GROUPED_SURFACE_CLASS
            : "rounded-2xl bg-white dark:bg-card border border-border p-5 shadow-sm",
        )}
      >
        <Loader2 className="w-5 h-5 animate-spin text-redmix mb-3" />
        <p className="text-xs font-semibold text-foreground/80 text-center px-4">
          {t("Searching cars...")}
        </p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div
        className={cn(
          isGrouped
            ? GROUPED_SURFACE_CLASS
            : "rounded-2xl border border-border/60 p-3 shadow-sm bg-white dark:bg-card shrink-0",
        )}
      >
        <div className="flex items-center gap-2 mb-0">
          {/* <CarIcon className="w-4 h-4 text-foreground/80" /> */}
          <h3 className="text-sm font-bold text-foreground/80">
            {t("Car Rentals")}
          </h3>
        </div>
        <p className="text-xs font-medium  text-foreground/80 p-0">
          {t(
            "No car rental availability found at this airport. Local taxi services or public transit may be recommended for your ground travel.",
          )}
        </p>
      </div>
    );
  }

  return (
    <section className={cn("relative shrink-0", isGrouped && "space-y-2")}>
      {/* {isGrouped && (
        <h3 className="px-1 text-[13px] font-semibold text-foreground/80">
          {t("Recommended Car Rentals")}
        </h3>
      )} */}
      <div
        className={cn(
          "relative overflow-hidden group shrink-0",
          isGrouped
            ? GROUPED_SURFACE_CLASS
            : "rounded-2xl bg-white dark:bg-card border border-border p-3 shadow-sm",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between relative z-10",
            isGrouped ? "px-4 pt-4 pb-2" : "mb-2",
          )}
        >
          {!isGrouped && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-redmix/10 text-redmix dark:text-foreground">
                <CarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-none">
                  {t("Recommended Car Rentals")}
                </h3>
              </div>
            </div>
          )}
          {isGrouped && (
            <p className="text-[13px] text-foreground/80 font-semibold">
              {t("Recommended Car Rentals")}
            </p>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={cn(
            "flex flex-col relative z-10 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent",
            isGrouped ? "max-h-[200px] px-2 pb-2" : "max-h-[170px] pr-2",
          )}
        >
          <div className="space-y-2">
            {cars.map((car) => (
              <CompactCarCard
                key={car.id}
                car={car}
                pickupDate={pickupDate}
                dropoffDate={dropoffDate}
                pickupLocation={destination}
                dropoffLocation={destination}
              />
            ))}
          </div>
        </div>

        {showArrow && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center text-foreground rounded-full p-1 shadow-md pointer-events-none animate-bounce">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </section>
  );
}
