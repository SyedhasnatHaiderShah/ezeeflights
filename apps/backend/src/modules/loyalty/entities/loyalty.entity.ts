export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type PointsTransactionType =
  | 'earned_flight'
  | 'earned_hotel'
  | 'earned_car'
  | 'earned_package'
  | 'redeemed'
  | 'expired'
  | 'referral_bonus'
  | 'birthday_bonus'
  | 'promotional'
  | 'manual_adjust'
  | 'partner_earn';

export interface LoyaltyAccountEntity {
  id: string;
  userId: string;
  pointsBalance: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  referralCode: string | null;
}

export interface LoyaltyTierEntity {
  tier: LoyaltyTier;
  minPointsRequired: number;
  earnMultiplier: number;
  benefits: Record<string, unknown>;
  colorHex: string;
}

export interface LoyaltyTransactionEntity {
  id: string;
  userId: string;
  points: number;
  type: PointsTransactionType;
  referenceId: string | null;
  description: string | null;
  balanceBefore: number;
  balanceAfter: number;
  expiresAt: Date | null;
  isExpired: boolean;
  createdAt: Date;
}

export interface MilestoneEntity {
  id: string;
  criteria: { type?: string; value?: number };
  pointsReward: number;
}

export interface RewardRuleEntity {
  id: string;
  action: 'BOOKING' | 'SIGNUP' | 'REFERRAL';
  pointsAwarded: number;
  conditions: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
