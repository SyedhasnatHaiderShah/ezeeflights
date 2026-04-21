import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface RecentSearch {
  id: string;
  origin: string;
  destination: string;
  date?: string;
  price?: string;
  flag?: string;
}

export function useRecentSearches(limit = 8, enabled = true) {
  return useQuery({
    queryKey: ["recent-searches", limit],
    queryFn: () => apiFetch<RecentSearch[]>(`/user/searches/recent?limit=${limit}`),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useDeleteRecentSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/user/searches/recent/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recent-searches"] }),
  });
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>("/user/searches/recent", { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recent-searches"] }),
  });
}
