import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface Deal {
  id: string;
  type: "flight" | "hotel" | "package";
  title: string;
  originCity?: string;
  destinationCity: string;
  airline?: string;
  price: number;
  originalPrice: number;
  savingPercent: number;
  departDate?: string;
  expiresAt?: string;
  imageUrl: string;
  isFlashSale: boolean;
}

const qs = (params?: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]),
  ).toString();
  return query ? `?${query}` : "";
};

export function useFeaturedDeals(limit = 8) {
  return useQuery({
    queryKey: ["deals", "featured", limit],
    queryFn: () => apiFetch<Deal[]>(`/deals/featured?limit=${limit}`),
    staleTime: 60 * 1000,
  });
}

export function useFlashDeals(limit = 4) {
  return useQuery({
    queryKey: ["deals", "flash", limit],
    queryFn: () => apiFetch<Deal[]>(`/deals/flash?limit=${limit}`),
    staleTime: 60 * 1000,
  });
}

export function useDeals(filters?: { type?: string; maxPrice?: number; limit?: number }) {
  return useQuery({
    queryKey: ["deals", "list", filters],
    queryFn: () => apiFetch<Deal[]>(`/deals${qs(filters as Record<string, string | number | undefined>)}`),
    staleTime: 60 * 1000,
  });
}
