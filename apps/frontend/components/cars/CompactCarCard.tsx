"use client";

import { useState, useEffect } from "react";
import { Check, MapPin } from "lucide-react";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { differenceInDays } from "date-fns";

interface CompactCar {
  id: string;
  name?: string;
  makeModel?: string;
  make?: string;
  model?: string;
  category?: string;
  passengerCount?: number;
  seats?: number;
  transmission?: string;
  pricePerDay: number;
  totalPrice?: number;
  currency?: string;
  partnerNetwork?: { name: string };
  images?: string[];
  mediaItems?: Array<{ url: string; sizeCode?: string; type?: string }>;
}

const VENDOR_NAMES: Record<string, string> = {
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

import { apiFetch } from "@/lib/api/client";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { useToast } from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/capacitor/platform";

interface Props {
  car: CompactCar;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export function CompactCarCard({
  car,
  pickupDate,
  dropoffDate,
  pickupLocation,
  dropoffLocation,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoadingStore();
  const selectedAddons = useBookingFlowStore((s) => s.selectedAddons);
  const toggleAddon = useBookingFlowStore((s) => s.toggleAddon);
  const { getConvertedAmount, baseCurrency } = useCurrencyStore();

  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const rawImage = car.images?.[0] || car.mediaItems?.[0]?.url;
  const displayImage = rawImage ? rawImage.replace(/^http:/i, "https:") : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  const rentalDays = 1;

  const carCurrency = car.currency || "USD";
  const rawTotalPrice =
    car.totalPrice && car.totalPrice > 0
      ? car.totalPrice
      : car.pricePerDay * rentalDays;

  // Convert the total rental price to USD for the addons store
  const totalPriceInUsd = getConvertedAmount(
    rawTotalPrice,
    carCurrency as CurrencyCode,
    "USD",
  );

  const isAdded = false;

  const carName =
    car.makeModel ||
    car.name ||
    `${car.make || ""} ${car.model || ""}`.trim() ||
    t("Rental Car");

  const vendorName =
    VENDOR_NAMES[car.partnerNetwork?.name || ""] ||
    car.partnerNetwork?.name ||
    t("Rental Partner");

  const handleSelect = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isNative()) {
      startLoading(t("Please wait..."));
    }
    try {
      const selectPayload = {
        carId: car.id,
        pickupLocationId: pickupLocation || "",
        dropoffLocationId: dropoffLocation || "",
        pickupDate: pickupDate || "",
        dropoffDate: dropoffDate || "",
        rateToken: "",
        inventoryToken: "",
        rateCode: "",
        totalPrice: totalPriceInUsd,
        currency: "USD",
      };

      const selectData = await apiFetch<{
        priceChanged: boolean;
        verifiedPrice?: number;
        currency?: string;
      }>("/cars/select", {
        method: "POST",
        body: JSON.stringify(selectPayload),
      });

      stopLoading();

      const params = new URLSearchParams();
      params.set("carId", car.id);
      params.set("vendor", car.partnerNetwork?.name || "");
      if (pickupLocation) {
        params.set("pickupLocation", pickupLocation);
        params.set("dropoffLocation", pickupLocation);
      }
      params.set("isSuggested", "true");
      if (pickupDate) params.set("pickupDate", pickupDate);
      if (dropoffDate) params.set("dropoffDate", dropoffDate);
      if (selectData?.verifiedPrice) {
        params.set("verifiedPrice", String(selectData.verifiedPrice));
        params.set("verifiedCurrency", selectData.currency || "USD");
      }

      const targetUrl = `/cars/booking?${params.toString()}`;
      if (isNative()) {
        stopLoading();
        router.push(targetUrl);
      } else {
        window.open(targetUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
      if (isNative()) {
        stopLoading();
      }
      toast({
        title: t("Selection Error"),
        description: t("Failed to select the car. Please try again."),
        variant: "destructive",
      });
    }
  };

  const formatPrice = (amount: number) => {
    const isBypass = car.id.startsWith("cr-");
    const activeCurrency = mounted && !isBypass ? baseCurrency : carCurrency;
    const currencyMeta =
      SUPPORTED_CURRENCIES[activeCurrency as CurrencyCode] ||
      SUPPORTED_CURRENCIES["USD"];

    let converted = amount;
    if (mounted && !isBypass) {
      converted = getConvertedAmount(
        amount,
        carCurrency.toUpperCase() as CurrencyCode,
        activeCurrency as CurrencyCode,
      );
    } else if (!mounted && !isBypass) {
      const fromCode = carCurrency.toUpperCase() as CurrencyCode;
      const fromRate = SUPPORTED_CURRENCIES[fromCode]?.rate || 1;
      const toRate = SUPPORTED_CURRENCIES["USD"].rate;
      converted = (amount / fromRate) * toRate;
    }

    return `${currencyMeta.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const formattedPerDay = formatPrice(car.pricePerDay);
  const formattedTotal = formatPrice(rawTotalPrice);

  const seatsCount = car.passengerCount || car.seats || 4;

  return (
    <div
      onClick={handleSelect}
      className={cn(
        "group cursor-pointer p-3 overflow-hidden rounded-xl border transition-all flex items-center h-[86px] shrink-0 mb-2 w-full relative",
        "border-border bg-card shadow-sm hover:border-redmix/30 hover:shadow",
      )}
    >
      {displayImage && !imageError && (
        <div className="w-[60px] h-[60px] rounded-lg shrink-0 overflow-hidden relative mr-3 bg-white border border-border/40 p-0.5 flex items-center justify-center">
          <img
            src={displayImage}
            alt={carName}
            className="h-[90%] w-[90%] object-contain transition-transform duration-500 group-hover:scale-[1.05]"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-between min-w-0 gap-3">
        {/* Left Section: Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-foreground truncate leading-snug">
            {carName}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-foreground font-semibold">
            <span className="text-foreground/45">•</span>
            <span>
              {seatsCount} {t("Seats")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-foreground/90 font-semibold">
            <span className="capitalize">
              {car.transmission?.toLowerCase() || t("Automatic")}
            </span>
            <span className="text-foreground/45">•</span>
            <span>
              {t("by")} {vendorName}
            </span>
          </div>
        </div>

        {/* Right Section: Pricing */}
        <div className="text-right shrink-0 flex flex-col justify-center items-end leading-tight">
          <span className="text-xs font-semibold text-foreground/80 mb-0.5">
            {t("Price per day")}
          </span>
          <div className="text-xs font-bold text-foreground/80">
            {formattedPerDay}
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
