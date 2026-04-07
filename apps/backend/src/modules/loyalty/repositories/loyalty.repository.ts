import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { LoyaltyAccountEntity, LoyaltyTier, LoyaltyTransactionEntity, RewardRuleEntity } from '../entities/loyalty.entity';

@Injectable()
export class LoyaltyRepository {
  constructor(private readonly db: PostgresClient) {}

  async getOrCreateAccount(userId: string): Promise<LoyaltyAccountEntity> {
    const row = await this.db.queryOne<LoyaltyAccountEntity>(
      `INSERT INTO loyalty_accounts (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING id, user_id as "userId", points_balance as "pointsBalance", tier, created_at as "createdAt", updated_at as "updatedAt"`,
      [userId],
    );

    if (!row) throw new Error('Unable to create loyalty account');
    return row;
  }

  findAccountById(accountId: string): Promise<LoyaltyAccountEntity | null> {
    return this.db.queryOne<LoyaltyAccountEntity>(
      `SELECT id, user_id as "userId", points_balance as "pointsBalance", tier, created_at as "createdAt", updated_at as "updatedAt"
       FROM loyalty_accounts WHERE id = $1`,
      [accountId],
    );
  }

  listTransactions(accountId: string): Promise<LoyaltyTransactionEntity[]> {
    return this.db.query<LoyaltyTransactionEntity>(
      `SELECT id, loyalty_account_id as "loyaltyAccountId", points, type, reference_id as "referenceId",
          expires_at as "expiresAt", created_at as "createdAt"
        FROM loyalty_transactions WHERE loyalty_account_id = $1 ORDER BY created_at DESC`,
      [accountId],
    );
  }

  addTransaction(
    accountId: string,
    payload: { points: number; type: 'EARN' | 'REDEEM' | 'EXPIRE'; referenceId?: string; expiresAt?: Date },
  ): Promise<LoyaltyTransactionEntity | null> {
    return this.db.queryOne<LoyaltyTransactionEntity>(
      `INSERT INTO loyalty_transactions (loyalty_account_id, points, type, reference_id, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, loyalty_account_id as "loyaltyAccountId", points, type, reference_id as "referenceId",
          expires_at as "expiresAt", created_at as "createdAt"`,
      [accountId, payload.points, payload.type, payload.referenceId ?? null, payload.expiresAt ?? null],
    );
  }

  updateAccount(accountId: string, pointsBalance: number, tier: LoyaltyTier) {
    return this.db.queryOne<LoyaltyAccountEntity>(
      `UPDATE loyalty_accounts SET points_balance = $1, tier = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, user_id as "userId", points_balance as "pointsBalance", tier, created_at as "createdAt", updated_at as "updatedAt"`,
      [pointsBalance, tier, accountId],
    );
  }

  getRewardRules(): Promise<RewardRuleEntity[]> {
    return this.db.query<RewardRuleEntity>(
      `SELECT id, action, points_awarded as "pointsAwarded", conditions, created_at as "createdAt", updated_at as "updatedAt"
       FROM reward_rules`,
    );
  }

  async expirePoints(accountId: string): Promise<number> {
    const row = await this.db.queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(points), 0)::text as total
       FROM loyalty_transactions
       WHERE loyalty_account_id = $1 AND type = 'EARN' AND expires_at IS NOT NULL AND expires_at < NOW()`,
      [accountId],
    );
    const total = Number(row?.total ?? 0);
    if (total <= 0) return 0;

    await this.db.query(
      `UPDATE loyalty_transactions
       SET expires_at = NULL
       WHERE loyalty_account_id = $1 AND type='EARN' AND expires_at IS NOT NULL AND expires_at < NOW()`,
      [accountId],
    );

    return total;
  }
}
