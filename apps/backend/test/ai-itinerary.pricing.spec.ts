import { AiItineraryService } from '../src/modules/ai-itinerary/ai.service';

describe('AiItineraryService pricing', () => {
  it('estimates pricing with margin and transfers', () => {
    const service = new AiItineraryService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    const pricing = service.estimatePricing(1000, 250);

    expect(pricing.breakdown.transfers).toBe(80);
    expect(pricing.breakdown.margin).toBe(159.6);
    expect(pricing.estimated_total).toBe(1489.6);
  });
});
