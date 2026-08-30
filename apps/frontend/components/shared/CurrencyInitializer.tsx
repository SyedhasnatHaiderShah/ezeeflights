"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  useCurrencyStore,
  shouldRefreshRates,
} from "@/lib/store/currency-store";
import { getProfile } from "@/lib/api/profile";

export function CurrencyInitializer() {
  const fetchRates = useCurrencyStore((s) => s.fetchRates);
  const detectCurrency = useCurrencyStore((s) => s.detectCurrency);
  const userPinned = useCurrencyStore((s) => s.userPinned);
  const pathname = usePathname();

  useEffect(() => {
    const run = async () => {
      await fetchRates();
      if (!userPinned) {
        let profileCurrency: string | null | undefined;
        try {
          const profile = await getProfile({ suppressErrorLog: true }).catch(
            () => null,
          );
          profileCurrency =
            profile?.preferredCurrency ??
            (profile?.preferences as { currency?: string } | undefined)
              ?.currency;
        } catch {
          profileCurrency = undefined;
        }
        
        void detectCurrency(profileCurrency, true);
      }
    };
    void run();

    const interval = setInterval(() => {
      if (shouldRefreshRates(useCurrencyStore.getState().lastUpdated)) {
        void fetchRates();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchRates, detectCurrency, userPinned]);

  const isMounted = useRef(false);

  // Re-detect on navigation to catch any VPN/location changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!userPinned) {
      void detectCurrency(undefined, true);
    }
  }, [pathname, detectCurrency, userPinned]);

  return null;
}
