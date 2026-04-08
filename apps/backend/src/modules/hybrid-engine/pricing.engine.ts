import { Injectable } from '@nestjs/common';
import { PricingInput, PricingOutput } from './types/hybrid.types';

@Injectable()
export class PricingEngine {
  private readonly fxRates: Record<string, number> = {
    USD: 1,
    EUR: 0.91,
    GBP: 0.78,
    AED: 3.67,
  };

  recalculate(input: PricingInput): PricingOutput {
    const sourceCurrency = (input.baseCurrency ?? 'USD').toUpperCase();
    const targetCurrency = (input.targetCurrency ?? sourceCurrency).toUpperCase();
    const tier = input.packageTier ?? 'standard';

    const subtotal = input.flightPrice + input.hotelPrice + input.activitiesCost;
    const marginPct = tier === 'budget' ? 0.08 : tier === 'luxury' ? 0.18 : 0.12;
    const seasonalPct = this.getSeasonalAdjustmentPct();
    const surgePct = this.getSurgePct(input.flightPrice, input.hotelPrice);

    const margin = subtotal * marginPct;
    const seasonalAdjustment = subtotal * seasonalPct;
    const surgeAdjustment = subtotal * surgePct;
    const discount = (subtotal + margin + seasonalAdjustment + surgeAdjustment) * ((input.discountPct ?? 0) / 100);

    const totalUsd = subtotal + margin + seasonalAdjustment + surgeAdjustment - discount;
    const convertedTotal = this.convert(totalUsd, 'USD', targetCurrency);

    return {
      currency: targetCurrency,
      baseSubtotal: this.round(this.convert(subtotal, sourceCurrency, targetCurrency)),
      margin: this.round(this.convert(margin, sourceCurrency, targetCurrency)),
      seasonalAdjustment: this.round(this.convert(seasonalAdjustment, sourceCurrency, targetCurrency)),
      surgeAdjustment: this.round(this.convert(surgeAdjustment, sourceCurrency, targetCurrency)),
      discount: this.round(this.convert(discount, sourceCurrency, targetCurrency)),
      totalPrice: this.round(convertedTotal),
      details: {
        marginPct,
        seasonalPct,
        surgePct,
      },
    };
  }

  private getSeasonalAdjustmentPct(): number {
    const month = new Date().getUTCMonth() + 1;
    if ([6, 7, 8, 12].includes(month)) return 0.1;
    if ([4, 5, 9, 10].includes(month)) return 0.05;
    return 0.02;
  }

  private getSurgePct(flightPrice: number, hotelPrice: number): number {
    const volatile = flightPrice > 1500 || hotelPrice > 2000;
    return volatile ? 0.07 : 0.03;
  }

  private convert(amount: number, from: string, to: string): number {
    const fromRate = this.fxRates[from] ?? 1;
    const toRate = this.fxRates[to] ?? 1;
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}
