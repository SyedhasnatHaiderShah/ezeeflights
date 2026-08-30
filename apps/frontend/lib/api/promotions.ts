import { apiFetch } from './client';

export type PromotionKind = 'PERCENT' | 'FIXED';

export type PromotionDiscount = {
  code: string;
  title: string;
  description?: string;
  kind: PromotionKind;
  source: 'coupon' | 'campaign';
  amount: number;
  autoApply: boolean;
  flashSale: boolean;
  endsAt?: string;
  message: string;
};

export type PromotionCampaign = {
  code: string;
  title: string;
  description?: string;
  kind: PromotionKind;
  value: number;
  active?: boolean;
  countdownEndsAt?: string | null;
};

export type PromotionValidationResult = {
  bookingId: string;
  subtotal: number;
  currency: string;
  travelerCount: number;
  bookingCount: number;
  loyaltyTier: string;
  promoCode: string | null;
  promoStatus: 'VALID' | 'INVALID' | 'NOT_ELIGIBLE' | 'NOT_PROVIDED';
  promoMessage: string;
  appliedDiscounts: PromotionDiscount[];
  totalDiscount: number;
  finalSubtotal: number;
  flashSaleEndsAt: string | null;
  recommendations: Array<{ code: string; title: string; description?: string; active: boolean; endsAt: string | null }>;
};

export const validatePromotion = (query: {
  bookingId: string;
  code?: string;
  partnerCode?: string;
  travelers?: number;
  currency?: string;
}) => {
  const params = new URLSearchParams();
  params.set('bookingId', query.bookingId);
  if (query.code) params.set('code', query.code);
  if (query.partnerCode) params.set('partnerCode', query.partnerCode);
  if (typeof query.travelers === 'number') params.set('travelers', String(query.travelers));
  if (query.currency) params.set('currency', query.currency);
  return apiFetch<PromotionValidationResult>(`/promotions/validate?${params.toString()}`);
};

export const getActiveCampaigns = () => apiFetch<PromotionCampaign[]>('/promotions/campaigns/active');
