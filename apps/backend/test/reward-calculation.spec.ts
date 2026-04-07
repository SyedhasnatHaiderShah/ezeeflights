import { calculateAwardedPoints, resolveTier } from '../src/modules/loyalty/utils/reward-calculator';

describe('Reward calculator', () => {
  it('awards points by matching minAmount condition', () => {
    const points = calculateAwardedPoints(
      [{ id: '1', action: 'BOOKING', pointsAwarded: 150, conditions: { minAmount: 100 }, createdAt: new Date(), updatedAt: new Date() }],
      'BOOKING',
      { amount: 200 },
    );
    expect(points).toBe(150);
  });

  it('resolves tiers from points balance', () => {
    expect(resolveTier(0)).toBe('BRONZE');
    expect(resolveTier(1200)).toBe('SILVER');
    expect(resolveTier(2600)).toBe('GOLD');
    expect(resolveTier(5500)).toBe('PLATINUM');
  });
});
