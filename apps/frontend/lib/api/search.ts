import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { 
  clearGuestRecentSearches, 
  deleteGuestRecentSearch, 
  getGuestRecentSearches, 
  saveGuestRecentSearch 
} from "../storage/recent-searches-storage";

export interface RecentSearch {
  id: string;
  origin: string;
  destination: string;
  searchType: string;
  searchDate?: string;
  metadata?: any;
  createdAt: string;
}

export function useRecentSearches(limit = 3, enabled = true) {
  return useQuery({
    queryKey: ["recent-searches", limit],
    queryFn: () => apiFetch<RecentSearch[]>(`/user/searches/recent?limit=${limit}`),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useGuestRecentSearches() {
  return useQuery({
    queryKey: ["guest-recent-searches"],
    queryFn: () => getGuestRecentSearches(),
  });
}

export function useSaveRecentSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<RecentSearch, "id" | "createdAt">) => 
      apiFetch<RecentSearch>("/user/searches/recent", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recent-searches"] }),
  });
}

export function useSaveGuestSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<RecentSearch, "id" | "createdAt">) => saveGuestRecentSearch(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guest-recent-searches"] }),
  });
}

export function useDeleteRecentSearch(isGuest = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      isGuest 
        ? deleteGuestRecentSearch(id) 
        : apiFetch<void>(`/user/searches/recent/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-searches"] });
      queryClient.invalidateQueries({ queryKey: ["guest-recent-searches"] });
    },
  });
}

export function useClearRecentSearches(isGuest = false) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => 
      isGuest 
        ? clearGuestRecentSearches() 
        : apiFetch<void>("/user/searches/recent", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-searches"] });
      queryClient.invalidateQueries({ queryKey: ["guest-recent-searches"] });
    },
  });
}
