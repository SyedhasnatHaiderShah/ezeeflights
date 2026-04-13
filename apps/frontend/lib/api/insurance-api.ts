import { apiFetch, apiFetchAuth } from './client';

export interface InsurancePlan {
  id: string;
  name: string;
  coverageLevel: 'basic' | 'standard' | 'premium';
  planType: 'single_trip' | 'annual_multi_trip';
  coverageDetails: Record<string, unknown>;
  pricePerDay: number | null;
  priceAnnual: number | null;
  currency: string;
  adventureSportsAddonPrice: number | null;
}

export interface PremiumBreakdown {
  planId: string;
  currency: string;
  travelers: number;
  tripDays: number;
  basePremium: number;
  adventureSportsPremium: number;
  totalPremium: number;
}

export async function listInsurancePlans() {
  return apiFetch<InsurancePlan[]>('/insurance/plans');
}

export async function getInsurancePlan(planId: string) {
  return apiFetch<InsurancePlan>(`/insurance/plans/${planId}`);
}

export async function calculateInsurancePremium(payload: {
  planId: string;
  startDate: string;
  endDate: string;
  travelers: Array<{ name: string; dob: string; passport: string }>;
  adventureSports?: boolean;
}) {
  return apiFetch<PremiumBreakdown>('/insurance/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function purchaseInsurancePolicy(payload: {
  planId: string;
  startDate: string;
  endDate: string;
  travelers: Array<{ name: string; dob: string; passport: string }>;
  adventureSports?: boolean;
  destinationCountries?: string[];
}) {
  return apiFetchAuth('/insurance/policies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listMyPolicies() {
  return apiFetchAuth<any[]>('/insurance/policies/me');
}

export async function getPolicy(policyId: string) {
  return apiFetchAuth<any>(`/insurance/policies/${policyId}`);
}

export async function submitInsuranceClaim(payload: {
  policyId: string;
  claimType: string;
  description: string;
  incidentDate: string;
  claimedAmount: number;
  supportingDocuments?: string[];
}) {
  return apiFetchAuth('/insurance/claims', { method: 'POST', body: JSON.stringify(payload) });
}
