import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface Review {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorLocation: string;
  rating: number;
  text: string;
  isVerified: boolean;
  createdAt: string;
  category?: string;
}

export interface ReviewsResponse {
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewStats {
  distribution: Record<number, number>;
  average: number;
  total: number;
}

const qs = (params?: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]),
  ).toString();

  return query ? `?${query}` : "";
};

export function useFeaturedReviews(limit = 8) {
  return useQuery({
    queryKey: ["reviews", "featured", limit],
    queryFn: () => apiFetch<Review[]>(`/reviews/featured?limit=${limit}`),
    staleTime: 60 * 1000,
  });
}

export function useReviews(filters?: { rating?: number; category?: string; verified?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["reviews", "list", filters],
    queryFn: () => apiFetch<Review[] | ReviewsResponse>(`/reviews/all${qs(filters)}`),
    staleTime: 30 * 1000,
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ["reviews", "stats"],
    queryFn: () => apiFetch<ReviewStats>("/reviews/stats"),
    staleTime: 60 * 1000,
  });
}

export function useAllReviews(filters?: { rating?: number; category?: string; verified?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["reviews", "all", filters],
    queryFn: () => apiFetch<Review[] | ReviewsResponse>(`/reviews/all${qs(filters)}`),
    staleTime: 60 * 1000,
  });
}
