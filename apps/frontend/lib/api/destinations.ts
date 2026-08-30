import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface Destination {
  id: string;
  name: string;
  country: string;
  code: string;
  region: "ASIA" | "EUROPE" | "AMERICAS" | "MIDDLE EAST" | "AFRICA" | string;
  heroImage: string;
  description: string;
  imageUrl: string;
  fromPrice: number;
  currency: string;
  flag: string;
  slug: string;
  isFeatured?: boolean;
  theme?: string[];
}

export interface DestinationTheme {
  slug: string;
  label: string;
  emoji: string;
  count: number;
}

const qs = (params?: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  ).toString();

  return query ? `?${query}` : "";
};

export function useDestinations(params?: {
  region?: string;
  theme?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["destinations", params],
    queryFn: () => Promise.resolve([] as Destination[]),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedDestinations(limit = 10) {
  return useQuery({
    queryKey: ["destinations", "featured", limit],
    queryFn: () => apiFetch<Destination[]>(`/home/top-destinations?limit=${limit}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDestinationThemes() {
  return useQuery({
    queryKey: ["destination-themes"],
    queryFn: () => Promise.resolve([] as DestinationTheme[]),
    staleTime: 10 * 60 * 1000,
  });
}
