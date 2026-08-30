"use client";

import React from "react";
import { searchHotels, Hotel } from "@/lib/api/hotels";
import { CompactHotelCard } from "@/components/hotels/CompactHotelCard";
import { useSearchParams } from "next/navigation";
import { Building2, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const GROUPED_SURFACE_CLASS =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";

interface Props {
  destination: string;
  checkInDate?: string;
  checkOutDate?: string;
  variant?: "sidebar" | "sheet";
}

export function CompactHotelsPanel({
  destination,
  checkInDate: checkInOverride,
  checkOutDate: checkOutOverride,
  variant = "sidebar",
}: Props) {
  const { t } = useTranslation();
  const isGrouped = variant === "sheet";
  const searchParams = useSearchParams();
  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const [loading, setLoading] = React.useState(true);

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
  const carPickupFormatted = formatParamDate(pickupDateParam);
  const carDropoffFormatted = formatParamDate(dropoffDateParam);

  const checkInDate =
    checkInOverride ||
    dDateParam ||
    carPickupFormatted ||
    format(addDays(new Date(), 1), "yyyy-MM-dd");

  let checkOutDate =
    checkOutOverride || format(addDays(new Date(checkInDate), 1), "yyyy-MM-dd");

  if (checkOutDate <= checkInDate) {
    try {
      const checkInParsed = new Date(checkInDate);
      if (!Number.isNaN(checkInParsed.getTime())) {
        checkOutDate = format(addDays(checkInParsed, 1), "yyyy-MM-dd");
      } else {
        checkOutDate = format(addDays(new Date(), 2), "yyyy-MM-dd");
      }
    } catch {
      checkOutDate = format(addDays(new Date(), 2), "yyyy-MM-dd");
    }
  }

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);

    searchHotels({
      city: destination,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
    })
      .then((res) => {
        if (mounted) {
          setHotels(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch hotels:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [destination, checkInDate, checkOutDate]);

  const sortedHotels = React.useMemo(() => {
    return [...hotels].sort(
      (a, b) => (a.minPricePerNight || 0) - (b.minPricePerNight || 0),
    );
  }, [hotels]);

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
  }, [sortedHotels, checkScroll]);

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
        <Loader2 className="h-6 w-6 animate-spin text-redmix mb-3" />
        <p className="text-xs font-semibold text-foreground/80 text-center px-4">
          {t("Finding top hotels in")} {destination}
        </p>
      </div>
    );
  }

  if (sortedHotels.length === 0) {
    return null;
  }

  return (
    <section className={cn("relative shrink-0", isGrouped && "space-y-2")}>
      {isGrouped && (
        <h3 className="px-1 text-[13px] font-semibold text-foreground/80">
          {t("Available Hotels")}
        </h3>
      )}
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
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground leading-none">
                  {t("Available Hotels")}
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                  {t("Live availability for ")} {destination}
                </p>
              </div>
            </div>
          )}
          {/* {isGrouped && (
          <p className="text-[13px] text-foreground/80">
            {t("Live availability for ")} {destination}
          </p>
        )} */}
        </div>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={cn(
            "flex flex-col relative z-10 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent",
            isGrouped ? "max-h-[200px] px-2 pb-2" : "max-h-[170px] pr-2",
          )}
        >
          {sortedHotels.map((hotel) => (
            <CompactHotelCard
              key={hotel.id}
              hotel={hotel}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
            />
          ))}
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
