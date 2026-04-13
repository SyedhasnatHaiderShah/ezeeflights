export type InsurancePlanType = 'single_trip' | 'annual_multi_trip';
export type CoverageLevel = 'basic' | 'standard' | 'premium';
export type InsuranceStatus = 'active' | 'expired' | 'cancelled' | 'claimed';
export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';

export interface InsuranceProvider {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  apiEndpoint: string | null;
  apiKeyEnvVar: string | null;
  isActive: boolean;
}

export interface InsurancePlan {
  id: string;
  providerId: string | null;
  providerName: string | null;
  name: string;
  planType: InsurancePlanType;
  coverageLevel: CoverageLevel;
  description: string | null;
  pricePerDay: number | null;
  priceAnnual: number | null;
  currency: string;
  maxTripDurationDays: number | null;
  coverageDetails: Record<string, unknown>;
  adventureSportsAddonPrice: number | null;
  ageLimitMax: number;
  isActive: boolean;
  createdAt: string;
}

export interface InsurancePolicy {
  id: string;
  userId: string;
  planId: string;
  policyNumber: string;
  status: InsuranceStatus;
  startDate: string;
  endDate: string;
  destinationCountries: string[];
  travelerDetails: Array<Record<string, unknown>>;
  adventureSportsAddon: boolean;
  totalPremium: number;
  currency: string;
  paymentId: string | null;
  policyDocumentUrl: string | null;
  providerPolicyRef: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  userId: string;
  claimType: string;
  description: string;
  incidentDate: string;
  claimedAmount: number;
  currency: string;
  status: ClaimStatus;
  supportingDocuments: string[];
  approvedAmount: number | null;
  rejectionReason: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
