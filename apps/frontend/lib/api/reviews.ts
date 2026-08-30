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

/** Only show reviews with this rating or higher in marketing surfaces. */
export const MIN_POSITIVE_REVIEW_RATING = 4;

export function filterPositiveReviews(reviews: Review[]): Review[] {
  return reviews.filter((review) => review.rating >= MIN_POSITIVE_REVIEW_RATING);
}

export function extractReviews(
  raw: Review[] | ReviewsResponse | undefined,
  options?: { minRating?: number },
): Review[] {
  if (!raw) return [];

  const reviews = Array.isArray(raw) ? raw : (raw.data ?? []);
  if (options?.minRating == null) return reviews;

  return reviews.filter((review) => review.rating >= options.minRating!);
}

export function applyMinRatingFilter(
  raw: Review[] | ReviewsResponse,
  minRating?: number,
): Review[] | ReviewsResponse {
  if (minRating == null) return raw;

  if (Array.isArray(raw)) {
    return extractReviews(raw, { minRating });
  }

  return {
    ...raw,
    data: extractReviews(raw.data, { minRating }),
  };
}

const qs = (params?: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
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

export function useReviews(filters?: {
  rating?: number;
  search?: string;
  category?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  minRating?: number;
}) {
  const { minRating, ...apiFilters } = filters ?? {};

  return useQuery({
    queryKey: ["reviews", "list", filters],
    queryFn: async () => {
      const raw = await apiFetch<Review[] | ReviewsResponse>(
        `/reviews/all${qs(apiFilters)}`,
      );
      return applyMinRatingFilter(raw, minRating);
    },
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

export function useAllReviews(filters?: {
  rating?: number;
  search?: string;
  category?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  minRating?: number;
}) {
  const { minRating, ...apiFilters } = filters ?? {};

  return useQuery({
    queryKey: ["reviews", "all", filters],
    queryFn: async () => {
      const raw = await apiFetch<Review[] | ReviewsResponse>(
        `/reviews/all${qs(apiFilters)}`,
      );
      return applyMinRatingFilter(raw, minRating);
    },
    staleTime: 60 * 1000,
  });
}

/** Maps API review shape to the ReviewCard / hotels Review type. */
export function mapApiReviewToCard(review: Review) {
  return {
    id: review.id,
    userName: review.authorName,
    userAvatar: review.authorAvatar,
    rating: review.rating,
    comment: review.text,
    date: review.createdAt,
    isVerified: review.isVerified,
  };
}
