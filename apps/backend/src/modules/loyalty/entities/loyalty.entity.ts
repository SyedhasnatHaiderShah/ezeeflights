export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type LoyaltyTxType = 'EARN' | 'REDEEM' | 'EXPIRE';

export interface LoyaltyAccountEntity {
  id: string;
  userId: string;
  pointsBalance: number;
  tier: LoyaltyTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransactionEntity {
  id: string;
  loyaltyAccountId: string;
  points: number;
  type: LoyaltyTxType;
  referenceId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface RewardRuleEntity {
  id: string;
  action: 'BOOKING' | 'SIGNUP' | 'REFERRAL';
  pointsAwarded: number;
  conditions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
