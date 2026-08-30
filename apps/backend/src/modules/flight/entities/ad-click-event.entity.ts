export interface AdClickEvent {
  id: string;
  adOfferId: string;
  userIp: string;
  userAgent: string;
  countryCode?: string;
  clickedAt: Date;
  // Set asynchronously via postback / S2S callback from partner
  converted: boolean;
  commissionAmount?: number;
  commissionCurrency?: string;
}
