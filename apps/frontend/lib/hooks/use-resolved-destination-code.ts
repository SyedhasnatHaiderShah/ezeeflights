"use client";

import { useEffect, useMemo, useState } from "react";
import { extractIataCodeFromLocation } from "@/lib/store/destination-insights-store";
import {
  getAirportByCode,
  searchAirports,
} from "@/lib/utils/airport-search";

/**
 * Resolves a location string to a 3-letter IATA code (sync parse first, then airport lookup).
 */
export function useResolvedDestinationCode(location?: string): {
  code: string;
  isResolving: boolean;
} {
  const syncCode = useMemo(
    () => extractIataCodeFromLocation(location),
    [location],
  );
  const [code, setCode] = useState(syncCode);
  const [isResolving, setIsResolving] = useState(
    () => Boolean(location?.trim()) && syncCode.length !== 3,
  );

  useEffect(() => {
    const trimmed = (location || "").trim();
    if (!trimmed) {
      setCode("");
      setIsResolving(false);
      return;
    }

    const immediate = extractIataCodeFromLocation(trimmed);
    if (immediate.length === 3) {
      setCode(immediate);
      setIsResolving(false);
      return;
    }

    let cancelled = false;
    setIsResolving(true);

    (async () => {
      try {
        if (trimmed.length === 3) {
          const airport = await getAirportByCode(trimmed);
          if (!cancelled && airport?.iata_code) {
            setCode(airport.iata_code.toUpperCase());
            setIsResolving(false);
            return;
          }
        }

        const results = await searchAirports(trimmed);
        const match = results.find((a) => a.iata_code);
        if (!cancelled) {
          setCode(match?.iata_code?.toUpperCase() || "");
          setIsResolving(false);
        }
      } catch {
        if (!cancelled) {
          setCode("");
          setIsResolving(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location, syncCode]);

  return { code, isResolving };
}
