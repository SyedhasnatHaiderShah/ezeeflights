import { useQuery } from "@tanstack/react-query";

export interface PublicStats {
  // Flights
  totalTravelers: number;
  airlinesCount: number;
  countriesCount: number;
  avgRating: number;
  // Hotels
  totalGuests: number;
  hotelsCount: number;
  destinationsCount: number;
  hotelRating: number;
  // Cars
  totalRenters: number;
  rentalsCount: number;
  regionsCount: number;
  carRating: number;
}

export function usePublicStats() {
  const fallbackStats: PublicStats = {
    totalTravelers: 2000000,
    airlinesCount: 500,
    countriesCount: 150,
    avgRating: 4.9,

    totalGuests: 1500000,
    hotelsCount: 8000,
    destinationsCount: 250,
    hotelRating: 4.8,

    totalRenters: 500000,
    rentalsCount: 120,
    regionsCount: 85,
    carRating: 4.7,
  };

  return useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      return fallbackStats;
    },
    staleTime: 60 * 60 * 1000,
  });
}
