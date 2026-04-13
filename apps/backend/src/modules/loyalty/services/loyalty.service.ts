import { BadRequestException, Injectable } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { PointsTransactionType } from '../entities/loyalty.entity';
import { LoyaltyRepository } from '../repositories/loyalty.repository';

type BookingType = 'flight' | 'hotel' | 'car' | 'package';

@Injectable()
export class LoyaltyService {
  private readonly pointsPerDollar = 10;
  private readonly redeemRate = 100;

  constructor(
    private readonly repository: LoyaltyRepository,
    private readonly events: AppEventBus,
  ) {}

  async getMyAccount(userId: string) {
    return this.repository.getOrCreateAccount(userId);
  }

  async getTransactions(userId: string) {
    return this.repository.listTransactions(userId);
  }

  async earnPoints(
    userId: string,
    bookingTypeOrTotal: BookingType | number,
    bookingTotalOrReference?: number | string,
    currency = 'USD',
    referenceId?: string,
  ) {
    const bookingType: BookingType = typeof bookingTypeOrTotal === 'string' ? bookingTypeOrTotal : 'flight';
    const bookingTotal =
      typeof bookingTypeOrTotal === 'number' ? bookingTypeOrTotal : Number(bookingTotalOrReference ?? 0);
    const normalizedReferenceId =
      typeof bookingTypeOrTotal === 'number'
        ? (bookingTotalOrReference as string | undefined)
        : referenceId;

    const account = await this.repository.getOrCreateAccount(userId);
    const totalInUsd = this.convertToUsd(bookingTotal, currency);
    const basePoints = Math.floor(totalInUsd * this.pointsPerDollar);
    if (basePoints <= 0) return account;

    const tierData = await this.repository.getTierByName(account.tier);
    const multiplier = tierData?.earnMultiplier ?? 1;
    const awardedPoints = Math.floor(basePoints * multiplier);
    const balanceAfter = account.pointsBalance + awardedPoints;
    const lifetimeAfter = account.lifetimePoints + awardedPoints;

    await this.repository.addTransaction({
      userId,
      points: awardedPoints,
      type: this.bookingTypeToTxType(bookingType),
      balanceBefore: account.pointsBalance,
      balanceAfter,
      referenceId: normalizedReferenceId,
      description: `${bookingType} booking points`,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    const maybeTier = await this.updateTier(userId, balanceAfter, lifetimeAfter);
    await this.awardMilestones(userId);
    this.events.emit('loyalty.points.earned', { userId, points: awardedPoints, balance: balanceAfter });

    return maybeTier;
  }

  async updateTier(userId: string, pointsBalance?: number, lifetimePoints?: number) {
    const account = await this.repository.getOrCreateAccount(userId);
    const tiers = await this.repository.listTiers();
    const currentLifetime = lifetimePoints ?? account.lifetimePoints;
    const currentBalance = pointsBalance ?? account.pointsBalance;
    const eligibleTier = tiers
      .filter((t) => currentLifetime >= t.minPointsRequired)
      .at(-1)?.tier ?? 'blue';

    const updated = await this.repository.updateUserLoyalty(userId, currentBalance, currentLifetime, eligibleTier);
    if (!updated) throw new BadRequestException('Failed to update loyalty tier');

    if (updated.tier !== account.tier) {
      this.events.emit('loyalty.tier.upgraded', { userId, fromTier: account.tier, toTier: updated.tier });
      this.events.emit('notification.send', {
        userId,
        type: 'tier_upgrade',
        message: `Congrats! You are now ${updated.tier.toUpperCase()}.`,
      });
    }

    return updated;
  }

  async redeemPoints(userId: string, points: number, bookingId?: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    if (points <= 0) throw new BadRequestException('Points must be greater than zero');
    if (account.pointsBalance < points) throw new BadRequestException('Insufficient points balance');

    const discountAmount = points / this.redeemRate;
    const balanceAfter = account.pointsBalance - points;

    await this.repository.addTransaction({
      userId,
      points: -Math.abs(points),
      type: 'redeemed',
      balanceBefore: account.pointsBalance,
      balanceAfter,
      referenceId: bookingId,
      description: `Redeemed for booking discount ($${discountAmount.toFixed(2)})`,
    });

    const updated = await this.repository.updateUserLoyalty(userId, balanceAfter, account.lifetimePoints, account.tier);
    return { account: updated, discountAmount };
  }

  async expirePoints() {
    const expired = await this.repository.findExpiredTransactions();
    for (const tx of expired) {
      const account = await this.repository.getOrCreateAccount(tx.userId);
      const deduction = Math.min(account.pointsBalance, tx.points);
      const balanceAfter = account.pointsBalance - deduction;
      await this.repository.addTransaction({
        userId: tx.userId,
        points: -deduction,
        type: 'expired',
        balanceBefore: account.pointsBalance,
        balanceAfter,
        description: 'Points expired after 12 months',
      });
      await this.repository.updateUserLoyalty(tx.userId, balanceAfter, account.lifetimePoints, account.tier);
      await this.repository.markExpiredTransactions([tx.id]);
    }

    const expiringSoon = await this.repository.findExpiringInDays(30);
    for (const tx of expiringSoon) {
      this.events.emit('notification.send', {
        userId: tx.userId,
        type: 'points_expiry_warning',
        message: `${tx.points} points expire on ${tx.expiresAt?.toISOString().slice(0, 10)}.`,
      });
    }

    return { expiredProcessed: expired.length, warningCount: expiringSoon.length };
  }

  async generateReferralCode(userId: string): Promise<string> {
    const seed = userId.replace(/-/g, '').slice(0, 4).toUpperCase();
    const suffix = this.randomId(4);
    const code = `EZF${seed}${suffix}`;
    await this.repository.updateReferralCode(userId, code);
    return code;
  }

  async applyReferralCode(newUserId: string, code: string) {
    const referrer = await this.repository.findUserByReferralCode(code);
    if (!referrer) throw new BadRequestException('Invalid referral code');
    if (referrer.userId === newUserId) throw new BadRequestException('You cannot refer yourself');

    const referral = await this.repository.createReferral(referrer.userId, newUserId, code);
    return { referralId: referral?.id, status: 'pending' };
  }

  async getBirthayBonus(userId: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    const bonus = 250;
    const balanceAfter = account.pointsBalance + bonus;
    const lifetimeAfter = account.lifetimePoints + bonus;

    await this.repository.addTransaction({
      userId,
      points: bonus,
      type: 'birthday_bonus',
      balanceBefore: account.pointsBalance,
      balanceAfter,
      description: 'Happy Birthday bonus',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    return this.updateTier(userId, balanceAfter, lifetimeAfter);
  }

  private async awardMilestones(userId: string) {
    const account = await this.repository.getOrCreateAccount(userId);
    const milestones = await this.repository.listActiveMilestones();
    for (const milestone of milestones) {
      const already = await this.repository.hasUserMilestone(userId, milestone.id);
      if (already) continue;
      if (milestone.criteria?.type === 'lifetime_points' && account.lifetimePoints >= Number(milestone.criteria.value ?? 0)) {
        await this.repository.awardMilestone(userId, milestone.id);
        if (milestone.pointsReward > 0) {
          const balanceAfter = account.pointsBalance + milestone.pointsReward;
          await this.repository.addTransaction({
            userId,
            points: milestone.pointsReward,
            type: 'promotional',
            balanceBefore: account.pointsBalance,
            balanceAfter,
            description: 'Milestone reward',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          });
          await this.repository.updateUserLoyalty(userId, balanceAfter, account.lifetimePoints + milestone.pointsReward, account.tier);
        }
      }
    }
  }

  private bookingTypeToTxType(bookingType: BookingType): PointsTransactionType {
    if (bookingType === 'hotel') return 'earned_hotel';
    if (bookingType === 'car') return 'earned_car';
    if (bookingType === 'package') return 'earned_package';
    return 'earned_flight';
  }

  private convertToUsd(amount: number, currency: string): number {
    const rates: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.28, AED: 0.27, INR: 0.012 };
    const normalized = currency.toUpperCase();
    return amount * (rates[normalized] ?? 1);
  }

  private randomId(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
