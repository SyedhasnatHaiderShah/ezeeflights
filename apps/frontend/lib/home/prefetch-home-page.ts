import { QueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Destination, DestinationTheme } from "@/lib/api/destinations";
import type { PackageSummary } from "@/lib/api/packages-api";
import type { Deal } from "@/lib/api/deals";
import type { PublicStats } from "@/lib/api/stats";
import type { Airline } from "@/lib/api/airlines";
import {
  applyMinRatingFilter,
  MIN_POSITIVE_REVIEW_RATING,
  type Review,
  type ReviewsResponse,
} from "@/lib/api/reviews";

const HOME_REVALIDATE_SEC = 60;
const fetchOpts = { next: { revalidate: HOME_REVALIDATE_SEC } } as RequestInit;

const REVIEWS_FILTERS = {
  page: 1,
  limit: 50,
  minRating: MIN_POSITIVE_REVIEW_RATING,
} as const;

function reviewsQs(filters: { page: number; limit: number }) {
  return `?page=${filters.page}&limit=${filters.limit}`;
}

/** Warm React Query cache on the server so home sections skip client waterfalls. */
export async function prefetchHomePageQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["destinations", "featured", 10],
      queryFn: () => Promise.resolve([] as Destination[]),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["deals", "featured", 8],
      queryFn: () => Promise.resolve([] as Deal[]),
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["packages", "featured", 6],
      queryFn: () => Promise.resolve({ data: [] as PackageSummary[], total: 0 }),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["destination-themes"],
      queryFn: () => Promise.resolve([] as DestinationTheme[]),
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["airlines"],
      queryFn: () => Promise.resolve([] as Airline[]),
      staleTime: 10 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["reviews", "all", REVIEWS_FILTERS],
      queryFn: async () => {
        const raw = await apiFetch<Review[] | ReviewsResponse>(
          `/reviews/all${reviewsQs(REVIEWS_FILTERS)}`,
        );
        return applyMinRatingFilter(raw, REVIEWS_FILTERS.minRating);
      },
      staleTime: 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: ["public-stats"],
      queryFn: () => Promise.resolve({} as PublicStats),
      staleTime: 60 * 60 * 1000,
    }),
  ]);
}
