"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const BookingForm = dynamic(
  () => import("@/components/booking-form").then((m) => m.BookingForm),
  { ssr: false }
);
import { Bell, BellRing, Globe } from "lucide-react";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  totalGuests: number;
  cabinClass: string;
}

export function FlightStickySearchPanel({
  origin,
  destination,
  departureDate,
  returnDate,
  totalGuests,
  cabinClass,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const { getConvertedAmount } = useCurrencyStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const trip = searchParams.get("trip");
      const dDateStr = trip === "multi-city" ? searchParams.get("dDate0") : searchParams.get("dDate");

      if (dDateStr) {
        const today = new Date();
        const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const [y, m, d] = dDateStr.split("-").map(Number);
        const depLocal = new Date(y, m - 1, d);

        const minLocal = new Date(todayLocal.getFullYear(), todayLocal.getMonth(), todayLocal.getDate() + 2);

        if (!isNaN(depLocal.getTime()) && depLocal < minLocal) {
          router.push("/?tab=flights&error=invalid_date");
        }
      }
    }
  }, [searchParams, router]);

  const usdRate = 450; // Mock base rate
  const eurAmount = getConvertedAmount(usdRate, "USD", "EUR");
  const aedAmount = getConvertedAmount(usdRate, "USD", "AED");

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-3 py-1 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex-1 truncate text-foreground font-medium flex items-center gap-4">
            <p>
              {destination ? (
                <>
                  <span className="text-foreground">{origin}</span> →{" "}
                  <span className="text-foreground">{destination}</span>
                </>
              ) : (
                <span className="text-foreground">{origin}</span>
              )}{" "}
              | {departureDate}
              {returnDate ? ` – ${returnDate}` : ""} | {totalGuests}{" "}
              {mounted ? (totalGuests > 1 ? t("guests") : t("Adult")) : "guests"}{" "}
              | {mounted ? t(cabinClass) : cabinClass}
            </p>

            {/* <div className="hidden md:flex items-center gap-3 border-l border-border pl-4">
               <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                 <Globe className="h-3 w-3" />
                 Simultaneous: ${usdRate}
                 {mounted && (
                   <> | €{Math.round(eurAmount)} | AED {Math.round(aedAmount).toLocaleString()}</>
                 )}
               </div>
            </div> */}
          </div>

          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => setIsTracking(!isTracking)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-all",
                isTracking
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              )}
            >
              {isTracking ? (
                <BellRing className="h-3 w-3" />
              ) : (
                <Bell className="h-3 w-3" />
              )}
              {isTracking ? "Tracking Prices" : "Track Prices"}
            </button> */}

            <button
              className="text-foreground hover:text-foreground/80 font-semibold cursor-pointer hover:underline transition-all shrink-0"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? t("Close") : t("Edit Search")}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <>
              {/* Backdrop to close on click outside */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/20 backdrop-blur-[2px] z-30"
                onClick={() => setExpanded(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute top-full left-0 right-0 mt-2 mx-4 z-40 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar"
              >
                <div className="flex items-center justify-end pr-3 pt-2">
                  <button
                    onClick={() => setExpanded(false)}
                    className="text-redmix hover:text-white font-semibold cursor-pointer hover:underline transition-all shrink-0"
                  >
                    {t("Close")}
                  </button>
                </div>
                <div className="p-3 md:p-5">
                  <BookingForm
                    heroMode={false}
                    onSearch={() => setExpanded(false)}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
