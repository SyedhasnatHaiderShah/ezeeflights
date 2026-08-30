import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../query/query-client";
import { apiFetch } from "./client";
import {
  normalizeDestinationCode,
  useDestinationInsightsStore,
} from "../store/destination-insights-store";

export type DestinationInsights = {
  weather: {
    condition: string;
    tempC: number;
    highC: number;
    lowC: number;
    humidity: number;
    forecast: Array<{
      day: string;
      icon: string;
      highC: number;
      lowC: number;
    }>;
  };
  attractions?: Array<{
    name: string;
    category: string;
    rating: number;
    fromPrice: number;
  }>;
};

const STALE_MS = 1000 * 60 * 60 * 24;
const GC_MS = 1000 * 60 * 60 * 24 * 7;

export function destinationInsightsQueryKey(destination?: string) {
  return ["destination-insights", normalizeDestinationCode(destination)] as const;
}

type DestinationInsightsResponse = {
  success: boolean;
  data?: DestinationInsights;
  error?: string;
  message?: string;
};

async function fetchDestinationInsights(dest: string): Promise<DestinationInsights> {
  const d = normalizeDestinationCode(dest);
  const json = await apiFetch<DestinationInsightsResponse>(
    `/ai/destination-insights?destination=${encodeURIComponent(d)}`,
    undefined,
    { suppressErrorLog: true },
  );
  if (!json?.success || !json.data) {
    throw new Error(json?.error || json?.message || "No insights available");
  }
  return json.data;
}

function syncInsightsToStore(destination: string, data: DestinationInsights) {
  useDestinationInsightsStore.getState().setCachedInsights(destination, data);
}

function getLocalCachedInsights(
  code: string,
): DestinationInsights | undefined {
  return useDestinationInsightsStore.getState().getCachedInsights(code);
}

/** Warm cache from localStorage + React Query (no network). */
export function seedDestinationInsightsCache(
  destination: string,
): DestinationInsights | undefined {
  const code = normalizeDestinationCode(destination);
  if (code.length !== 3) return undefined;

  useDestinationInsightsStore.getState().hydratePersisted();
  const local = getLocalCachedInsights(code);
  if (!local) return undefined;

  const key = destinationInsightsQueryKey(code);
  queryClient.setQueryData(key, local);
  return local;
}

/** Prefetch on destination select or search — does not block navigation. */
export async function prefetchDestinationInsights(
  destination?: string,
): Promise<DestinationInsights | undefined> {
  const code = normalizeDestinationCode(destination);
  if (!code || code.length !== 3) return undefined;

  useDestinationInsightsStore.getState().setSearchDestination(code);

  const seeded = seedDestinationInsightsCache(code);
  if (seeded) return seeded;

  const key = destinationInsightsQueryKey(code);
  const queryCached = queryClient.getQueryData<DestinationInsights>(key);
  if (queryCached) {
    syncInsightsToStore(code, queryCached);
    return queryCached;
  }

  try {
    await queryClient.prefetchQuery({
      queryKey: key,
      queryFn: () => fetchDestinationInsights(code),
      staleTime: STALE_MS,
      gcTime: GC_MS,
    });
    const data = queryClient.getQueryData<DestinationInsights>(key);
    if (data) syncInsightsToStore(code, data);
    return data;
  } catch {
    return getLocalCachedInsights(code);
  }
}

export function beginDestinationInsightsSearch(destination?: string) {
  void prefetchDestinationInsights(destination);
}

export function useDestinationInsights(destination?: string) {
  const code = normalizeDestinationCode(destination);
  const storeCached = useDestinationInsightsStore((s) =>
    code ? s.cache[code] : undefined,
  );
  const queryCached = queryClient.getQueryData<DestinationInsights>(
    destinationInsightsQueryKey(code),
  );
  const initialData = storeCached ?? queryCached;

  return useQuery<DestinationInsights, Error>({
    queryKey: destinationInsightsQueryKey(code),
    queryFn: () => fetchDestinationInsights(code),
    enabled: code.length === 3,
    initialData,
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnMount: !initialData,
    placeholderData: (prev) => prev ?? initialData,
  });
}
