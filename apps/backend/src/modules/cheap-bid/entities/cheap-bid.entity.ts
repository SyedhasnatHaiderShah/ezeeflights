export interface CheapBidOfferRecord {
  id: number;
  source: string | null;
  originFrom: string | null;
  destinationTo: string | null;
  airLine: string | null;
  travellType: string | null;
  cabin: string | null;
  departureDate: Date | string | null;
  returnDate: Date | string | null;
  bidAdtPrice: number | null;
  bidChdPrice: number | null;
  bidInfPrice: number | null;
  originalAdtPrice?: number | null;
  originalChdPrice?: number | null;
  originalInfPrice?: number | null;
  currency: string | null;
  discountType?: string | null;
  linkExpiryDate: Date | string | null;
  status: string;
  flightId?: string | null;
  stops?: number | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

export interface CheapBidPublicView {
  bidId: number;
  bidToken: string;
  origin: string;
  destination: string;
  bidPrice: number;
  depositAmount: number;
  currency: string;
  discountType: string | null;
  linkExpiryDate: string | null;
  airLine: string | null;
  cabin: string | null;
  travellType: string | null;
  bidAdtPrice: number | null;
  bidChdPrice: number | null;
  bidInfPrice: number | null;
  originalAdtPrice: number | null;
  originalChdPrice: number | null;
  originalInfPrice: number | null;
  providerTotalFare?: number | null;
  stops?: number | null;
}

export interface CheapBidAppliedMeta {
  bidId: number;
  bidToken: string;
  /** Provider flight id the bid copy was created from. */
  sourceFlightId?: string;
  originalTotal: number;
  bidAdtPrice: number;
  bidChdPrice: number;
  bidInfPrice: number;
  originalAdtPrice?: number | null;
  originalChdPrice?: number | null;
  originalInfPrice?: number | null;
  discountType?: string | null;
  linkExpiryDate: string | null;
  providerTotalFare?: number | null;
  sourceCurrency?: string;
  stops?: number;
}
