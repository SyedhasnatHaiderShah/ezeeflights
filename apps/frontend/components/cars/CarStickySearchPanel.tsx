"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CarSearchContainer } from "./CarSearchContainer";

interface CarStickySearchPanelProps {
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  rentalDays: number;
}

export function CarStickySearchPanel({
  pickupLocation,
  dropoffLocation,
  pickupDate,
  dropoffDate,
  rentalDays,
}: CarStickySearchPanelProps) {
  const { t } = useTranslation();
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-16 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-4 py-1 space-y-3">
        <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex-1 truncate text-foreground font-medium flex items-center gap-2">
            <span className="font-bold text-brand-red">{t("Car Rental")}</span>
            <span className="text-muted-foreground">|</span>
            <span>{pickupLocation}</span>
            {dropoffLocation && dropoffLocation !== pickupLocation && (
              <>
                <span className="text-muted-foreground">→</span>
                <span>{dropoffLocation}</span>
              </>
            )}
            <span className="text-muted-foreground">|</span>
            <span>
              {pickupDate
                ? new Date(pickupDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}{" "}
              –{" "}
              {dropoffDate
                ? new Date(dropoffDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
            <span className="text-muted-foreground">|</span>
            <span>
              {rentalDays} {rentalDays === 1 ? t("Day") : t("Days")}
            </span>
          </div>
          <button
            onClick={() => setSearchExpanded(!searchExpanded)}
            className="text-brand-red hover:underline font-bold cursor-pointer shrink-0 text-xs"
          >
            {searchExpanded ? t("Close") : t("Edit Search")}
          </button>
        </div>

        <AnimatePresence>
          {searchExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-2"
            >
              <CarSearchContainer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
