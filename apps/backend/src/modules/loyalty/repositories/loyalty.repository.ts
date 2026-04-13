import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import {
  LoyaltyAccountEntity,
  LoyaltyTier,
  LoyaltyTierEntity,
  LoyaltyTransactionEntity,
  MilestoneEntity,
  PointsTransactionType,
} from '../entities/loyalty.entity';

@Injectable()
export class LoyaltyRepository {
  constructor(private readonly db: PostgresClient) {}

  async getOrCreateAccount(userId: string): Promise<LoyaltyAccountEntity> {
    const row = await this.db.queryOne<LoyaltyAccountEntity>(
      `UPDATE users
       SET loyalty_tier = COALESCE(loyalty_tier, 'blue'),
           loyalty_points = COALESCE(loyalty_points, 0),
           lifetime_points = COALESCE(lifetime_points, 0)
       WHERE id = $1
       RETURNING id, id as "userId", loyalty_points as "pointsBalance", lifetime_points as "lifetimePoints",
        loyalty_tier as tier, referral_code as "referralCode"`,
      [userId],
    );

    if (!row) throw new Error('User not found for loyalty account');
    return row;
  }

  listTransactions(userId: string): Promise<LoyaltyTransactionEntity[]> {
    return this.db.query<LoyaltyTransactionEntity>(
      `SELECT id, user_id as "userId", points, transaction_type as type, reference_id as "referenceId",
          description, balance_before as "balanceBefore", balance_after as "balanceAfter",
          expires_at as "expiresAt", is_expired as "isExpired", created_at as "createdAt"
       FROM points_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  getTierByName(tier: LoyaltyTier): Promise<LoyaltyTierEntity | null> {
    return this.db.queryOne<LoyaltyTierEntity>(
      `SELECT tier, min_points_required as "minPointsRequired", earn_multiplier::float8 as "earnMultiplier",
          benefits, color_hex as "colorHex"
       FROM loyalty_tiers
       WHERE tier = $1`,
      [tier],
    );
  }

  listTiers(): Promise<LoyaltyTierEntity[]> {
    return this.db.query<LoyaltyTierEntity>(
      `SELECT tier, min_points_required as "minPointsRequired", earn_multiplier::float8 as "earnMultiplier",
          benefits, color_hex as "colorHex"
       FROM loyalty_tiers
       ORDER BY min_points_required ASC`,
    );
  }

  addTransaction(payload: {
    userId: string;
    points: number;
    type: PointsTransactionType;
    balanceBefore: number;
    balanceAfter: number;
    referenceId?: string;
    description?: string;
    expiresAt?: Date | null;
  }): Promise<LoyaltyTransactionEntity | null> {
    return this.db.queryOne<LoyaltyTransactionEntity>(
      `INSERT INTO points_transactions (user_id, transaction_type, points, balance_before, balance_after, reference_id, description, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id as "userId", points, transaction_type as type, reference_id as "referenceId",
          description, balance_before as "balanceBefore", balance_after as "balanceAfter",
          expires_at as "expiresAt", is_expired as "isExpired", created_at as "createdAt"`,
      [
        payload.userId,
        payload.type,
        payload.points,
        payload.balanceBefore,
        payload.balanceAfter,
        payload.referenceId ?? null,
        payload.description ?? null,
        payload.expiresAt ?? null,
      ],
    );
  }

  updateUserLoyalty(userId: string, pointsBalance: number, lifetimePoints: number, tier: LoyaltyTier) {
    return this.db.queryOne<LoyaltyAccountEntity>(
      `UPDATE users
       SET loyalty_points = $1,
           lifetime_points = $2,
           loyalty_tier = $3
       WHERE id = $4
       RETURNING id, id as "userId", loyalty_points as "pointsBalance", lifetime_points as "lifetimePoints",
         loyalty_tier as tier, referral_code as "referralCode"`,
      [pointsBalance, lifetimePoints, tier, userId],
    );
  }

  async markExpiredTransactions(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.db.query(`UPDATE points_transactions SET is_expired = true WHERE id = ANY($1::uuid[])`, [ids]);
  }

  findExpiredTransactions(): Promise<LoyaltyTransactionEntity[]> {
    return this.db.query<LoyaltyTransactionEntity>(
      `SELECT id, user_id as "userId", points, transaction_type as type, reference_id as "referenceId",
          description, balance_before as "balanceBefore", balance_after as "balanceAfter",
          expires_at as "expiresAt", is_expired as "isExpired", created_at as "createdAt"
       FROM points_transactions
       WHERE expires_at < NOW() AND is_expired = false AND points > 0`,
    );
  }

  findExpiringInDays(days: number): Promise<LoyaltyTransactionEntity[]> {
    return this.db.query<LoyaltyTransactionEntity>(
      `SELECT id, user_id as "userId", points, transaction_type as type, reference_id as "referenceId",
          description, balance_before as "balanceBefore", balance_after as "balanceAfter",
          expires_at as "expiresAt", is_expired as "isExpired", created_at as "createdAt"
       FROM points_transactions
       WHERE expires_at >= NOW()
        AND expires_at < NOW() + ($1::text || ' days')::interval
        AND is_expired = false AND points > 0`,
      [days],
    );
  }

  updateReferralCode(userId: string, code: string) {
    return this.db.queryOne<{ referralCode: string }>(
      `UPDATE users SET referral_code = $1 WHERE id = $2 RETURNING referral_code as "referralCode"`,
      [code, userId],
    );
  }

  findUserByReferralCode(code: string): Promise<{ userId: string } | null> {
    return this.db.queryOne<{ userId: string }>(`SELECT id as "userId" FROM users WHERE referral_code = $1`, [code]);
  }

  createReferral(referrerId: string, refereeId: string, code: string) {
    return this.db.queryOne<{ id: string }>(
      `INSERT INTO referrals (referrer_id, referee_id, referral_code)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [referrerId, refereeId, code],
    );
  }

  listActiveMilestones(): Promise<MilestoneEntity[]> {
    return this.db.query<MilestoneEntity>(
      `SELECT id, criteria, points_reward as "pointsReward"
       FROM milestones
       WHERE is_active = true`,
    );
  }

  hasUserMilestone(userId: string, milestoneId: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `SELECT id FROM user_milestones WHERE user_id = $1 AND milestone_id = $2`,
      [userId, milestoneId],
    );
  }

  awardMilestone(userId: string, milestoneId: string): Promise<void> {
    return this.db.query(
      `INSERT INTO user_milestones (user_id, milestone_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, milestone_id) DO NOTHING`,
      [userId, milestoneId],
    ).then(() => undefined);
  }
}
