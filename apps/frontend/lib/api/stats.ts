import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface PublicStats {
  totalTravelers: number;
  airlinesCount: number;
  countriesCount: number;
  avgRating: number;
}

export function usePublicStats() {
  return useQuery({
    queryKey: ["public-stats"],
    queryFn: () => apiFetch<PublicStats>("/stats/public"),
    staleTime: 60 * 60 * 1000,
  });
}
