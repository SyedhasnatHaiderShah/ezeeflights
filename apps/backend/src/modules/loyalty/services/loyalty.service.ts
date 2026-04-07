import { BadRequestException, Injectable } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { LoyaltyRepository } from '../repositories/loyalty.repository';
import { calculateAwardedPoints, resolveTier } from '../utils/reward-calculator';

@Injectable()
export class LoyaltyService {
  constructor(
    private readonly repository: LoyaltyRepository,
    private readonly events: AppEventBus,
  ) {}

  async getMyAccount(userId: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    await this.applyExpiry(account.id);
    return this.repository.getOrCreateAccount(userId);
  }

  async getTransactions(userId: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    return this.repository.listTransactions(account.id);
  }

  async earnPoints(userId: string, amount: number, referenceId?: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    const rules = await this.repository.getRewardRules();
    const points = calculateAwardedPoints(rules, 'BOOKING', { amount });
    if (points <= 0) {
      return account;
    }

    await this.repository.addTransaction(account.id, {
      points,
      type: 'EARN',
      referenceId,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    const newBalance = account.pointsBalance + points;
    const nextTier = resolveTier(newBalance);
    const updated = await this.repository.updateAccount(account.id, newBalance, nextTier);
    if (!updated) throw new BadRequestException('Failed to update loyalty account');

    this.events.emit('loyalty.points.earned', { userId, points, balance: updated.pointsBalance });
    if (account.tier !== updated.tier) {
      this.events.emit('loyalty.tier.upgraded', { userId, fromTier: account.tier, toTier: updated.tier });
    }

    return updated;
  }

  async redeemPoints(userId: string, points: number, referenceId?: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    await this.applyExpiry(account.id);
    const refreshed = await this.repository.getOrCreateAccount(userId);

    if (points > refreshed.pointsBalance) {
      throw new BadRequestException('Insufficient points balance');
    }

    await this.repository.addTransaction(refreshed.id, {
      points: -Math.abs(points),
      type: 'REDEEM',
      referenceId,
    });

    const newBalance = refreshed.pointsBalance - points;
    const tier = resolveTier(newBalance);
    const updated = await this.repository.updateAccount(refreshed.id, newBalance, tier);
    if (!updated) throw new BadRequestException('Failed to redeem points');

    return updated;
  }

  async applyExpiry(accountId: string) {
    const expired = await this.repository.expirePoints(accountId);
    if (expired <= 0) return;

    await this.repository.addTransaction(accountId, { points: -expired, type: 'EXPIRE' });
    const current = await this.repository.findAccountById(accountId);
    if (!current) {
      return;
    }
    const nextBalance = Math.max(0, current.pointsBalance - expired);
    await this.repository.updateAccount(accountId, nextBalance, resolveTier(nextBalance));
  }
}
