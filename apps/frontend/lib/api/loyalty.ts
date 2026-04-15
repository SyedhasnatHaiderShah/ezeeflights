import { apiFetch } from './client';
export type LoyaltyAccount=Record<string,unknown>; export type LoyaltyTransaction=Record<string,unknown>; export type RedeemResult=Record<string,unknown>; export type Reward=Record<string,unknown>; export type TierBenefits=Record<string,unknown>;
export const getAccount=()=>apiFetch<LoyaltyAccount>('/loyalty/me');
export const getTransactions=(page=1,limit=20)=>apiFetch<LoyaltyTransaction[]>(`/loyalty/transactions?page=${page}&limit=${limit}`);
export const redeemPoints=(points:number,bookingId?:string)=>apiFetch<RedeemResult>('/loyalty/redeem',{method:'POST',body:JSON.stringify({points,bookingId})});
export const getRewards=()=>apiFetch<Reward[]>('/loyalty/rewards');
export const getTierBenefits=(tier:string)=>apiFetch<TierBenefits>(`/loyalty/tier-benefits/${tier}`);
export const getReferralCode=()=>apiFetch<{code:string}>('/loyalty/referral-code');
export const applyReferralCode=(code:string)=>apiFetch<{pointsAwarded:number}>('/loyalty/apply-referral',{method:'POST',body:JSON.stringify({code})});
