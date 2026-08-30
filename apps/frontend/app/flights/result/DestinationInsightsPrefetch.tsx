"use client";

import { useEffect, useRef } from "react";
import {
  beginDestinationInsightsSearch,
  seedDestinationInsightsCache,
} from "@/lib/api/destination-insights";
import { normalizeDestinationCode } from "@/lib/store/destination-insights-store";

interface Props {
  destination: string;
}

/** Runs as soon as the results page shell mounts — before flight list hydration. */
export function DestinationInsightsPrefetch({ destination }: Props) {
  const lastPrefetched = useRef<string | null>(null);

  useEffect(() => {
    const code = normalizeDestinationCode(destination);
    if (code.length !== 3 || lastPrefetched.current === code) return;
    lastPrefetched.current = code;
    seedDestinationInsightsCache(code);
    beginDestinationInsightsSearch(code);
  }, [destination]);

  return null;
}
