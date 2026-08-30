import { AiPromptBuilder } from '../src/modules/ai-itinerary/ai.prompt.builder';

describe('AiPromptBuilder', () => {
  it('builds prompt with strict schema and inputs', () => {
    const builder = new AiPromptBuilder();
    const prompt = builder.buildGeneratePrompt({
      destination: 'Bali',
      durationDays: 5,
      budgetMin: 1000,
      budgetMax: 3000,
      travelerType: 'couple',
      preferences: ['relaxation'],
    });

    expect(prompt.system).toContain('Return ONLY strict JSON');
    expect((prompt.user as any).destination).toBe('Bali');
    expect((prompt.user as any).travel_dates.duration_days).toBe(5);
  });
});
