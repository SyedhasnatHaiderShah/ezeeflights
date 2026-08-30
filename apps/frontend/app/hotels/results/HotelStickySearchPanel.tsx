"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Map } from "lucide-react";
import dynamic from "next/dynamic";

const BookingForm = dynamic(
  () => import("@/components/booking-form").then((m) => m.BookingForm),
  { ssr: false }
);
import { useTranslation } from "react-i18next";

interface Props {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  adults: string;
  rooms: string;
  query: string;
}

function formatGuestsLabel(adults: string, rooms: string, t: any): string {
  const a = parseInt(adults, 10) || 1;
  const r = parseInt(rooms, 10) || 1;
  return `${a} ${a !== 1 ? t("Guests") : t("Guest")}, ${r} ${r !== 1 ? t("Rooms") : t("Room")}`;
}

export function HotelStickySearchPanel({
  city,
  checkInDate,
  checkOutDate,
  adults,
  rooms,
  query,
}: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const guestsLabel = formatGuestsLabel(adults, rooms, t);
  const dateRange =
    checkInDate && checkOutDate
      ? `${checkInDate} – ${checkOutDate}`
      : checkInDate || checkOutDate || "";

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40 relative">
      <div className="max-w-7xl mx-auto px-3 py-1 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex-1 truncate text-foreground font-medium flex items-center gap-4">
            <p>
              <span className="text-foreground">{city || t("Anywhere")}</span>
              {dateRange ? <> | {dateRange}</> : null} | {guestsLabel}
            </p>

            {/* {query ? (
              <div className="hidden md:flex items-center gap-3 border-l border-border pl-4 shrink-0">
                <Link
                  href={`/hotels/map-view?${query}` as `/hotels/map-view?${string}`}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Map className="h-3 w-3" />
                  Map View
                </Link>
              </div>
            ) : null} */}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
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
                className="absolute top-full left-0 right-0 mt-2 mx-2 sm:mx-4 z-40 bg-card border border-border shadow-2xl rounded-2xl overflow-visible max-h-[85vh] overflow-y-auto custom-scrollbar min-w-0"
              >
                <div className="flex items-center justify-end pr-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="text-redmix hover:text-white font-semibold cursor-pointer hover:underline transition-all shrink-0"
                  >
                    {t("Close")}
                  </button>
                </div>
                <div className="p-2 sm:p-3 min-w-0 w-full max-w-full">
                  <BookingForm
                    heroMode={false}
                    animateIn={false}
                    defaultTab="hotels"
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
