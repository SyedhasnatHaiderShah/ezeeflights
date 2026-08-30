export type WalletTransactionType =
  | 'topup'
  | 'booking_payment'
  | 'refund'
  | 'referral_bonus'
  | 'loyalty_redeem'
  | 'promotional_credit'
  | 'withdrawal';

export interface WalletEntity {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransactionEntity {
  id: string;
  walletId: string;
  userId: string;
  transactionType: WalletTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
