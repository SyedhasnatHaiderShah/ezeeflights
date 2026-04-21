import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

export function useLoyaltyProfile() {
  return useQuery({
    queryKey: ["loyalty", "profile"],
    queryFn: () => apiFetch("/loyalty/profile"),
  });
}

export function useLoyaltyTierBenefits() {
  return useQuery({
    queryKey: ["loyalty", "tier-benefits"],
    queryFn: () => apiFetch<LoyaltyTier[]>("/loyalty/tier-benefits"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useLoyaltyTransactions(page = 1) {
  return useQuery({
    queryKey: ["loyalty", "transactions", page],
    queryFn: () => apiFetch(`/loyalty/transactions?page=${page}`),
  });
}

export function useReferralCode() {
  return useQuery({
    queryKey: ["loyalty", "referral-code"],
    queryFn: () => apiFetch<{ code: string }>("/loyalty/referral-code"),
  });
}
