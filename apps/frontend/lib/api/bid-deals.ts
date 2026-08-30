import { apiFetch } from "./client";

export interface BidDeal {
  id: string;
  origin: string;
  destination: string;
  bidPrice: number;
  depositAmount: number;
  currency: string;
}

export interface CreateDepositResponse {
  depositId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export const getBidDeal = (origin: string, destination: string) =>
  apiFetch<BidDeal | null>(
    `/bid-deals/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
  );

export const createBidDepositOrder = (data: {
  dealId: string;
  departureDate: string;
  passengers: any[];
  userId?: string;
  origin?: string;
  destination?: string;
  currency?: string;
  depositAmount?: number;
}) =>
  apiFetch<CreateDepositResponse>(`/bid-deals/deposit/create-order`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const verifyBidDeposit = (data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) =>
  apiFetch<any>(`/bid-deals/deposit/verify`, {
    method: "POST",
    body: JSON.stringify(data),
  });
