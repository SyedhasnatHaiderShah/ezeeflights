"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/lib/store/currency-store";

export function CurrencyInitializer() {
  const { fetchRates, detectCurrency, lastUpdated, isDetected } =
    useCurrencyStore();

  useEffect(() => {
    // Detect currency based on IP if not already done
    if (!isDetected) {
      detectCurrency();
    }

    // Fetch rates if they are older than 15 minutes or never fetched
    const fifteenMinutes = 15 * 60 * 1000;
    const now = Date.now();

    if (now - lastUpdated > fifteenMinutes) {
      fetchRates();
    }

    // Set up interval to refresh rates every 15 minutes
    const interval = setInterval(() => {
      fetchRates();
    }, fifteenMinutes);

    return () => clearInterval(interval);
  }, [fetchRates, detectCurrency, lastUpdated, isDetected]);

  return null;
}
