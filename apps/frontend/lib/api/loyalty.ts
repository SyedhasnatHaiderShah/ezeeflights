import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { LoyaltyAccount } from "./profile";

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

/** Uses GET /loyalty/me (not /loyalty/profile). */
export function useLoyaltyProfile(enabled = true) {
  return useQuery({
    queryKey: ["loyalty", "me"],
    queryFn: () => apiFetch<LoyaltyAccount>("/loyalty/me"),
    enabled,
    staleTime: 60_000,
  });
}

export function useLoyaltyTierBenefits() {
  return useQuery({
    queryKey: ["loyalty", "tier-benefits"],
    queryFn: () => apiFetch<LoyaltyTier[]>("/loyalty/tier-benefits"),
    enabled: false,
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
    enabled: false,
  });
}
