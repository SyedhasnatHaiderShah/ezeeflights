"use client";

import { useState, useEffect } from "react";
import { MapPin, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/capacitor/platform";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { differenceInDays } from "date-fns";
import { Hotel } from "@/lib/types/hotels";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import { useToast } from "@/lib/hooks/use-toast";

import { apiFetch } from "@/lib/api/client";
import { useLoadingStore } from "@/lib/store/use-loading-store";

interface Props {
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
}

export function CompactHotelCard({ hotel, checkInDate, checkOutDate }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const setSelectedHotel = useHotelBookingFlowStore((s) => s.setSelectedHotel);
  const { startLoading, stopLoading } = useLoadingStore();
  const image = hotel.images?.[0]?.url || "";

  const selectedAddons = useBookingFlowStore((s) => s.selectedAddons);
  const toggleAddon = useBookingFlowStore((s) => s.toggleAddon);
  const { getConvertedAmount, baseCurrency } = useCurrencyStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const stayDays =
    differenceInDays(new Date(checkOutDate), new Date(checkInDate)) || 1;
  const totalPrice = (hotel.minPricePerNight || 0) * stayDays;

  // Convert the total stay price to USD for the addons store
  const totalPriceInUsd = getConvertedAmount(
    totalPrice,
    (hotel.currency || "USD") as any,
    "USD",
  );

  const isAdded = false;

  const [isThisSelecting, setIsThisSelecting] = useState(false);

  const handleSelect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const targetUrl = `/hotels/booking?hotelId=${hotel.id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&isSuggested=true`;

    if (isNative()) {
      if (isThisSelecting) return;
      setIsThisSelecting(true);
      startLoading(t("Please wait..."));
      try {
        const selectPayload = {
          hotelId: hotel.id,
          roomId: hotel.rooms?.[0]?.id || "default-room",
          checkInDate,
          checkOutDate,
          totalPrice,
          currency: hotel.currency || "USD",
        };
        const data = await apiFetch<{ verifiedPrice: number; currency?: string }>("/hotels/select", {
          method: "POST",
          body: JSON.stringify(selectPayload),
        });
        const nights =
          differenceInDays(new Date(checkOutDate), new Date(checkInDate)) || 1;
        const updatedHotel = {
          ...hotel,
          minPricePerNight: Number((data.verifiedPrice / nights).toFixed(2)),
          currency: data.currency || hotel.currency || "USD",
        };
        setSelectedHotel(updatedHotel);
        stopLoading();
        router.push(targetUrl);
      } catch (err) {
        console.error(err);
        setIsThisSelecting(false);
        stopLoading();
        toast({
          title: t("Selection Error"),
          description: t("Failed to select the hotel. Please try again."),
          variant: "destructive",
        });
      }
    } else {
      window.open(targetUrl, "_blank");
    }
  };

  const formatPrice = (amount: number) => {
    const isBypass = hotel.id.startsWith("ht-");
    const activeCurrency =
      mounted && !isBypass ? baseCurrency : hotel.currency || "USD";
    const currencyMeta =
      SUPPORTED_CURRENCIES[activeCurrency as CurrencyCode] ||
      SUPPORTED_CURRENCIES["USD"];

    let converted = amount;
    if (mounted && !isBypass) {
      converted = getConvertedAmount(
        amount,
        (hotel.currency || "USD").toUpperCase() as CurrencyCode,
        activeCurrency as CurrencyCode,
      );
    } else if (!mounted && !isBypass) {
      const fromCode = (hotel.currency || "USD").toUpperCase() as CurrencyCode;
      const fromRate = SUPPORTED_CURRENCIES[fromCode]?.rate || 1;
      const toRate = SUPPORTED_CURRENCIES["USD"].rate;
      converted = (amount / fromRate) * toRate;
    }

    return `${currencyMeta.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const formattedPerNight = formatPrice(hotel.minPricePerNight || 0);
  const formattedTotal = formatPrice(totalPrice);

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "group cursor-pointer p-3 overflow-hidden rounded-xl border transition-all flex items-center h-[86px] shrink-0 mb-2 w-full relative",
        "border-border bg-card shadow-sm hover:border-redmix/30 hover:shadow",
      )}
    >

      {image && (
        <div className="w-[60px] h-[60px] rounded-lg shrink-0 overflow-hidden relative mr-3">
          <img
            src={image}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-between min-w-0 gap-3">
        {/* Left Section: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-foreground truncate leading-snug">
            {hotel.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-foreground font-semibold">
            {!!hotel.starRating && (
              <div className="flex text-amber-500">
                {[...Array(hotel.starRating)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            )}
            {!!hotel.starRating && (
              <span className="text-foreground/45">•</span>
            )}
            <span className="text-foreground/90 truncate">{hotel.city}</span>
          </div>
          {!!hotel.userRating && (
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-foreground/90 font-semibold pl-2">
              <span className="font-bold text-white text-[8px] bg-redmix px-1 py-0.5 rounded leading-none">
                {hotel.userRating.toFixed(1)}
              </span>
              <span className="text-foreground/60">
                {hotel.userRating >= 4.5 ? t("Exceptional") : t("Excellent")}
              </span>
              {!!hotel.reviewCount && (
                <>
                  <span className="text-foreground/45">•</span>
                  <span className="text-[10px] text-muted-foreground font-bold tracking-tighter">
                    {hotel.reviewCount} {t("reviews")}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Pricing */}
        <div className="text-right shrink-0 flex flex-col justify-center items-end leading-tight">
          <span className="text-xs font-semibold text-foreground/80 mb-0.5">
            {t("Price per night")}
          </span>
          <div className="text-xs font-bold text-foreground/80">
            {formattedPerNight}
          </div>
          <div className="text-sm text-foreground font-medium mt-0.5">
            {t("Total")}:{" "}
            <span className="font-semibold text-redmix dark:text-white">
              {formattedTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
