import { apiFetchAuth } from './client';

export type HybridGeneratePayload = {
  destination: string;
  travelDates: { startDate: string; endDate: string };
  travelers: number;
  budget: number;
  preferences: string[];
  origin?: string;
  currency?: string;
};

export const generateLivePackage = (payload: HybridGeneratePayload) =>
  apiFetchAuth<any>('/hybrid/generate-live-package', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const recalculatePackagePrice = (query: {
  flightPrice: number;
  hotelPrice: number;
  activitiesCost: number;
  packageTier?: 'budget' | 'standard' | 'luxury';
  baseCurrency?: string;
  targetCurrency?: string;
}) => {
  const params = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
  return apiFetchAuth<any>(`/pricing/recalculate?${params.toString()}`);
};
