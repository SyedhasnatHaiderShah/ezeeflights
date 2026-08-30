"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { WishlistButton } from "@/components/destinations/WishlistButton";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { differenceInDays } from "date-fns";
import { Hotel } from "@/lib/types/hotels";
import { cn } from "@/lib/utils";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { apiFetch } from "@/lib/api/client";

const REQUIREMENT_EXPLANATIONS: Record<string, string> = {
  Guarantee:
    "A credit card is required to guarantee your booking. The hotel will not charge your card immediately, but will hold the room. Payment is typically made at the hotel.",
  Deposit:
    "A deposit (typically the first night or a percentage) is required to secure your booking. The hotel will charge your card shortly after booking.",
  Prepayment:
    "Full prepayment is required to book this hotel. Your card will be charged for the total booking amount.",
  Other:
    "Special terms or policies apply to secure this booking. Additional details will be provided during checkout.",
};

interface Props {
  rating?: number;
  distance?: string;
  ratingProvider?: string;
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  onCompareToggle?: (hotelId: string, selected: boolean) => void;
  isCompared?: boolean;
  isBooked?: boolean;
}

export function HotelCard({
  hotel,
  checkInDate,
  checkOutDate,
  onCompareToggle,
  isCompared,
  isBooked = false,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const adults = parseInt(searchParams?.get("adults") || "1", 10);
  const rooms = parseInt(searchParams?.get("rooms") || "1", 10);
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const { startLoading, stopLoading } = useLoadingStore();
  const setSelectedHotel = useHotelBookingFlowStore((s) => s.setSelectedHotel);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [isThisSelecting, setIsThisSelecting] = useState(false);

  const images = useMemo(() => {
    const existing = hotel.images?.map((img) => img.url) || [];
    const filtered = existing.filter(
      (url) => {
        if (!url) return false;
        const u = url.toLowerCase();
        const isImage = /\.(jpg|jpeg|png|gif|webp)/i.test(u);
        return (
          isImage &&
          !u.includes("placeholder") &&
          !u.includes("default") &&
          !u.includes("missing") &&
          !u.includes("noimage") &&
          !u.includes("no-image") &&
          !u.includes("notavailable") &&
          !u.includes("not-available") &&
          !u.includes("images.unsplash.com") &&
          !u.includes("vfmii.com")
        );
      }
    );

    // Group by base URL to deduplicate size variations
    const groups: Record<string, string[]> = {};
    for (const url of filtered) {
      const baseUrl = url.replace(/_[EHJO]\.(jpg|jpeg|png|gif|webp)$/i, '.$1');
      if (!groups[baseUrl]) {
        groups[baseUrl] = [];
      }
      groups[baseUrl].push(url);
    }

    const selectedUrls: string[] = [];
    for (const baseUrl of Object.keys(groups)) {
      const urls = groups[baseUrl];
      // Quality priority: Medium (H), Small (E), Large (J), Extra Large (O)
      let selected = urls.find((u) => u.match(/_H\.(jpg|jpeg|png|gif|webp)$/i));
      if (!selected) selected = urls.find((u) => u.match(/_E\.(jpg|jpeg|png|gif|webp)$/i));
      if (!selected) selected = urls.find((u) => u.match(/_J\.(jpg|jpeg|png|gif|webp)$/i));
      if (!selected) selected = urls.find((u) => u.match(/_O\.(jpg|jpeg|png|gif|webp)$/i));
      if (!selected) selected = urls[0];
      selectedUrls.push(selected);
    }

    // Remove the first image if we have multiple images (it is mostly a blurry overview or logo)
    let finalUrls = selectedUrls;
    if (finalUrls.length > 1) {
      finalUrls = finalUrls.slice(1);
    }

    if (finalUrls.length === 0) {
      return [];
    }

    return finalUrls;
  }, [hotel.images]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleSelect = async () => {
    if (isBooked || isThisSelecting) return;
    const targetUrl = `/hotels/booking?hotelId=${hotel.id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;

    setIsThisSelecting(true);
    startLoading(t("Please wait..."));
    try {
      const selectPayload = {
        hotelId: hotel.id,
        roomId: hotel.rooms?.[0]?.id || "default-room",
        checkInDate,
        checkOutDate,
        totalPrice:
          (hotel.minPricePerNight || 0) *
          (differenceInDays(new Date(checkOutDate), new Date(checkInDate)) ||
            1),
        currency: hotel.currency || "USD",
      };

      const data = await apiFetch<{ verifiedPrice: number; currency?: string }>(
        "/hotels/select",
        {
          method: "POST",
          body: JSON.stringify(selectPayload),
        },
      );

      const nights =
        differenceInDays(new Date(checkOutDate), new Date(checkInDate)) || 1;
      const updatedHotel = {
        ...hotel,
        minPricePerNight: Number((data.verifiedPrice / nights).toFixed(2)),
        currency: data.currency || hotel.currency || "USD",
      };
      setSelectedHotel(updatedHotel);
      router.push(targetUrl as any);
    } catch (err) {
      console.error(err);
      setIsThisSelecting(false);
      stopLoading();
    }
  };

  const selectButtonClass = isBooked
    ? "bg-emerald-600/10 text-redmix dark:text-white font-semibold xl:font-bold rounded-[10px] xl:rounded-xl shadow-none border border-emerald-600/30 cursor-not-allowed opacity-90"
    : "bg-redmix text-white font-semibold xl:font-bold rounded-[10px] xl:rounded-xl shadow-none xl:shadow-lg xl:shadow-redmix/20 hover:brightness-110 active:scale-[0.97] xl:active:scale-[0.98] transition-all cursor-pointer";

  const stayDays =
    differenceInDays(new Date(checkOutDate), new Date(checkInDate)) || 1;
  const totalPrice = (hotel.minPricePerNight || 0) * stayDays;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all mb-3 relative flex flex-col sm:flex-row">
      {images.length > 0 && (
        <div className="relative aspect-[4/3] sm:aspect-auto sm:w-48 md:w-56 lg:w-44 xl:w-52 2xl:w-60 shrink-0 overflow-hidden sm:border-r border-b sm:border-b-0 border-border/50">
          <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((src, idx) => (
                <div
                  key={`${hotel.id}-${idx}`}
                  className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden bg-muted/20"
                >
                  <img
                    src={src}
                    alt={`${hotel.name} view ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm p-1.5 text-white opacity-0 transition-all hover:bg-black/50 group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm p-1.5 text-white opacity-0 transition-all hover:bg-black/50 group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col xl:flex-row flex-1 w-full">
        <div className="flex-1 p-3 flex flex-col justify-center gap-3 relative">
          {/* <WishlistButton
            entityId={hotel.id}
            entityType="hotels"
            data={hotel}
            className="absolute right-3 top-3 z-20 bg-background/80 p-2 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-95 border border-border/50 2xl:hidden text-foreground hover:text-redmix"
          /> */}

          {(hotel.isBestForTrip ||
            hotel.rooms?.some((r) => r.freeCancellation) ||
            hotel.reserveRequirement ||
            isBooked) && (
            <div className="flex flex-wrap gap-2 pr-10">
              {hotel.isBestForTrip && (
                <span className="rounded-full bg-gradient-to-r from-redmix to-orange-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5 animate-pulse w-fit">
                  <Sparkles className="w-3 h-3" /> {t("BEST VALUE")}
                </span>
              )}
              {hotel.rooms?.some((r) => r.freeCancellation) && (
                <span className="rounded-full bg-emerald-500/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-600 shadow-sm border border-emerald-500/20 w-fit">
                  {t("Free Cancellation")}
                </span>
              )}
              {hotel.reserveRequirement && (
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="rounded-full bg-amber-400/20 dark:bg-amber-100/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-redmix dark:text-white shadow-sm border border-amber-500/20 dark:border-white w-fit cursor-help flex items-center gap-1 transition-all outline-none">
                        {t("Requirement")}: {t(hotel.reserveRequirement)}
                        <HelpCircle className="w-3 h-3 text-redmix/80 dark:text-white/80 shrink-0" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] p-3 text-xs bg-white dark:bg-card border border-border shadow-lg rounded-xl z-[60]">
                      <p className="font-bold text-foreground mb-1">
                        {t(hotel.reserveRequirement)} {t("Requirement")}
                      </p>
                      <p className="text-foreground/80 leading-relaxed font-medium normal-case">
                        {t(
                          REQUIREMENT_EXPLANATIONS[hotel.reserveRequirement] ||
                            REQUIREMENT_EXPLANATIONS.Other,
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {/* {isBooked && (
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm border border-emerald-700/30">
                  {t("Booked")}
                </span>
              )} */}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold leading-wider text-foreground line-clamp-2">
                  {hotel.name || t("Unnamed Property")}
                </h3>
                <p className="flex items-center gap-1 text-xs text-foreground/90 font-semibold tracking-tight">
                  <MapPin className="h-3 w-3 text-brand-red shrink-0" />{" "}
                  <span className="truncate">
                    {hotel.address ? `${hotel.address}, ` : ""}
                    {hotel.city || t("Unknown City")},{" "}
                    {hotel.country || t("Unknown Country")}
                  </span>
                </p>
                {hotel.distance && (
                  <p className="text-xs text-foreground/80 font-medium">
                    📍{" "}
                    {(() => {
                      const parts = hotel.distance.trim().split(/\s+/);
                      if (parts.length < 3)
                        return `${hotel.distance} ${t("from reference point")}`;
                      const [valStr, unit, dir] = parts;
                      const val = parseFloat(valStr);
                      let unitFull = unit;
                      if (unit.toUpperCase() === "MI") {
                        unitFull = val === 1 ? t("Mile") : t("Miles");
                      } else if (unit.toUpperCase() === "KM") {
                        unitFull = val === 1 ? t("Kilometer") : t("Kilometers");
                      }
                      const directionMap: Record<string, string> = {
                        N: t("North"),
                        S: t("South"),
                        E: t("East"),
                        W: t("West"),
                        NE: t("Northeast"),
                        NW: t("Northwest"),
                        SE: t("Southeast"),
                        SW: t("Southwest"),
                      };
                      const dirFull = directionMap[dir.toUpperCase()] || dir;
                      const refSuffix = hotel.city ? ` (${hotel.city})` : "";
                      return `${valStr} ${unitFull} ${dirFull} ${t("from reference point")}${refSuffix}`;
                    })()}
                  </p>
                )}
                {(hotel.phoneNumber || hotel.faxNumber) && (
                  <p className="text-xs text-foreground/80 font-medium flex items-center gap-3 mt-0.5 flex-wrap">
                    {hotel.phoneNumber && <span>📞 {hotel.phoneNumber}</span>}
                    {hotel.faxNumber && <span>📠 {t("Fax")}: {hotel.faxNumber}</span>}
                  </p>
                )}
                {(hotel.checkInTime || hotel.checkOutTime) && (
                  <p className="text-xs text-foreground/80 font-medium flex items-center gap-3 mt-0.5 flex-wrap">
                    {hotel.checkInTime && (
                      <span>
                        🕒 {t("Check-in")}: {hotel.checkInTime}
                      </span>
                    )}
                    {hotel.checkOutTime && (
                      <span>
                        🕒 {t("Check-out")}: {hotel.checkOutTime}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end shrink-0">
                {(hotel.starRating || 0) > 0 && (
                  <>
                    {hotel.ratingProvider && (
                      <span className="text-[9px] bg-slate-100 dark:bg-muted text-slate-500 px-1 py-0.5 rounded font-bold uppercase">
                        {hotel.ratingProvider}
                      </span>
                    )}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < (hotel.starRating || 0)
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-200 fill-slate-100 dark:text-muted dark:fill-muted",
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
                {/* <span className="text-xs font-semibold text-foreground mt-1 tracking-widest">
                  {hotel.type || t("Property")}
                </span> */}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {(hotel.reviewCount || 0) > 0 && (
                <div className="flex items-center gap-3">
                  <div className="bg-redmix/10 text-redmix w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border border-redmix/10">
                    {(hotel.userRating || 0).toFixed(1)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold leading-none text-foreground">
                      {(hotel.userRating || 0) >= 4.5
                        ? t("Exceptional")
                        : t("Excellent")}
                    </p>
                    <p className="text-[10px] text-foreground font-bold uppercase tracking-tighter">
                      {(hotel.reviewCount || 0).toLocaleString()} {t("reviews")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {hotel.amenities?.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center rounded-md bg-slate-50 dark:bg-muted/30 px-2 py-0.5 text-[10px] font-bold text-foreground/90 border border-slate-100"
                  >
                    {t(amenity)}
                  </span>
                ))}
              </div>
            </div>

            {/* Static Pricing Breakdown (Yellow scribble area) */}
            <div className="flex items-center gap-2 text-xs font-bold text-foreground/80 flex-wrap">
              <span className="text-foreground font-semibold">
                {t("Price per night")}:
              </span>
              <span className="font-bold text-foreground">
                <CurrencyDisplay
                  amount={hotel.minPricePerNight || 0}
                  currency={hotel.currency || "USD"}
                  bypassConversion={hotel.id.startsWith("ht-")}
                  amountClassName="font-extrabold text-xs"
                  showComparison={false}
                />
              </span>
              <span className="text-foreground font-bold my-0.5 leading-none">
                *
              </span>
              <span className="text-foreground font-semibold">
                {t("Nights")}:
              </span>
              <span className="font-bold text-foreground">{stayDays}</span>
            </div>

            {hotel.rooms && hotel.rooms.length > 0 && (
              <div className="pt-2 border-t border-border/40 mt-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="rooms-list" className="border-b-0">
                    <AccordionTrigger className="py-1.5 text-xs font-bold text-redmix hover:text-redmix/80 hover:no-underline flex justify-between items-center bg-slate-50 dark:bg-muted/30 px-3 rounded-lg border border-slate-100 dark:border-border/50">
                      <span>
                        🏨 {t("Available Room Types")} ({hotel.rooms.length})
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3 pb-1 px-1 space-y-2.5">
                      {hotel.rooms.slice(0, 5).map((room: any, idx: number) => (
                        <div
                          key={room.id || idx}
                          className="p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-muted/20 flex flex-col sm:flex-row justify-between gap-2.5 items-start sm:items-center"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-foreground line-clamp-1">
                              {room.roomType || room.name || t("Standard Room")}
                            </h4>
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {room.bedInfo && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                  🛏️ {room.bedInfo}
                                </span>
                              )}
                              {room.mealPolicy && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                  🍽️ {room.mealPolicy}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded border",
                                  room.freeCancellation
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                                    : "bg-slate-200/50 text-slate-600 dark:text-slate-400 border-slate-300/30",
                                )}
                              >
                                {room.freeCancellation
                                  ? t("Free Cancellation")
                                  : t("Non-refundable")}
                                {room.cancelDeadline
                                  ? ` (${t("before")} ${room.cancelDeadline.slice(0, 10)})`
                                  : ""}
                              </span>
                              {room.paymentPolicy && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                                  💳 {room.paymentPolicy}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-extrabold text-foreground">
                              <CurrencyDisplay
                                amount={
                                  room.pricePerNight ||
                                  room.totalPrice / stayDays ||
                                  0
                                }
                                currency={
                                  room.currency || hotel.currency || "USD"
                                }
                                bypassConversion={hotel.id.startsWith("ht-")}
                                amountClassName="font-extrabold text-xs text-redmix"
                                showComparison={false}
                              />
                              <span className="text-[10px] font-normal text-muted-foreground ml-1">
                                / {t("night")}
                              </span>
                            </span>
                            {room.availableRooms && (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                ⚡ {room.availableRooms} {t("rooms left")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {hotel.rooms.length > 5 && (
                        <p className="text-[10px] font-semibold text-center text-muted-foreground pt-1">
                          + {hotel.rooms.length - 5}{" "}
                          {t("more room options available when booking")}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
        {/* Pricing & Selection block */}
        <div className="w-full xl:w-48 shrink-0 border-t border-border/50 xl:dark:bg-muted/20 xl:border-t-0 xl:border-l xl:border-border px-4 py-4 xl:p-5 flex flex-row xl:flex-col justify-between xl:justify-center items-center gap-4 xl:gap-5 self-stretch">
          <div className="flex flex-col items-start xl:items-center text-left xl:text-center gap-1.5 w-full">
            <span className="text-xs font-bold text-foreground whitespace-nowrap">
              {stayDays} {stayDays === 1 ? t("Night") : t("Nights")}:{" "}
              <span className="text-redmix dark:text-foreground font-extrabold">
                <CurrencyDisplay
                  amount={totalPrice}
                  currency={hotel.currency || "USD"}
                  bypassConversion={hotel.id.startsWith("ht-")}
                  amountClassName="font-extrabold text-sm xl:text-xl"
                  showComparison={false}
                />
              </span>
            </span>
            {baseCurrency !== "USD" && !hotel.id.startsWith("ht-") && (
              <p className="text-[9px] font-bold text-foreground/85 whitespace-nowrap">
                ({t("approx.")} $
                {getConvertedAmount(
                  totalPrice,
                  hotel.currency || "USD",
                  "USD",
                ).toFixed(2)}{" "}
                USD)
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSelect}
            disabled={isBooked || isThisSelecting}
            className={cn(
              "w-auto xl:w-full min-w-[100px] h-10 xl:h-11 flex items-center justify-center text-[15px] xl:text-sm",
              selectButtonClass,
            )}
          >
            {isBooked
              ? t("Booked")
              : isThisSelecting
                ? t("Selecting...")
                : t("Book Now")}
          </button>
        </div>
      </div>
    </article>
  );
}
