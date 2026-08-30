import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearLocalRecentSearches,
  deleteLocalRecentSearch,
  getLocalRecentSearches,
  saveLocalRecentSearch,
  LocalRecentSearch,
} from "../storage/recent-searches-storage";

export type RecentSearch = LocalRecentSearch;

export function useLocalRecentSearches() {
  return useQuery({
    queryKey: ["local-recent-searches"],
    queryFn: () => getLocalRecentSearches(),
  });
}

export function useSaveLocalSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<RecentSearch, "id" | "createdAt">) =>
      saveLocalRecentSearch(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["local-recent-searches"] }),
  });
}

export function useDeleteLocalSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLocalRecentSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-recent-searches"] });
    },
  });
}

export function useClearLocalSearches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearLocalRecentSearches(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-recent-searches"] });
    },
  });
}
