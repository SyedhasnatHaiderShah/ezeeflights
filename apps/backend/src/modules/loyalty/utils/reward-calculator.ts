import { RewardRuleEntity } from '../entities/loyalty.entity';

export function calculateAwardedPoints(
  rules: RewardRuleEntity[],
  action: RewardRuleEntity['action'],
  facts: Record<string, unknown>,
): number {
  const matched = rules.filter((rule) => {
    if (rule.action !== action) {
      return false;
    }
    const minAmount = Number(rule.conditions.minAmount ?? 0);
    const amount = Number(facts.amount ?? 0);
    return amount >= minAmount;
  });

  if (matched.length === 0) {
    return 0;
  }

  return matched.reduce((acc, item) => Math.max(acc, item.pointsAwarded), 0);
}

export function resolveTier(pointsBalance: number): 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  if (pointsBalance >= 5000) return 'PLATINUM';
  if (pointsBalance >= 2500) return 'GOLD';
  if (pointsBalance >= 1000) return 'SILVER';
  return 'BRONZE';
}
