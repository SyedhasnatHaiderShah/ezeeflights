import { PricingEngine } from '../src/modules/hybrid-engine/pricing.engine';

describe('PricingEngine', () => {
  it('calculates dynamic totals with margin and adjustments', () => {
    const engine = new PricingEngine();
    const result = engine.recalculate({
      flightPrice: 900,
      hotelPrice: 600,
      activitiesCost: 200,
      baseCurrency: 'USD',
      targetCurrency: 'USD',
      packageTier: 'standard',
      discountPct: 5,
    });

    expect(result.totalPrice).toBeGreaterThan(0);
    expect(result.margin).toBeGreaterThan(0);
    expect(result.discount).toBeGreaterThan(0);
  });
});
