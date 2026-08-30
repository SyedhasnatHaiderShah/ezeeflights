export type PriceAlertType = 'flight' | 'hotel' | 'package';

export interface PriceAlertEntity {
  id: string;
  userId: string;
  type: PriceAlertType;
  searchParams: Record<string, unknown>;
  targetPrice: number;
  currency: string;
  channels: Array<'email' | 'sms' | 'whatsapp'>;
  isActive: boolean;
  lastCheckedAt: Date | null;
  triggeredAt: Date | null;
  createdAt: Date;
}
