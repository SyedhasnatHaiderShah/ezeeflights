import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface Airline {
  id: string;
  name: string;
  code?: string;
  logoUrl?: string;
}

export function useAirlines() {
  return useQuery({
    queryKey: ["airlines"],
    queryFn: () => apiFetch<Airline[]>("/airlines"),
    staleTime: 10 * 60 * 1000,
  });
}
