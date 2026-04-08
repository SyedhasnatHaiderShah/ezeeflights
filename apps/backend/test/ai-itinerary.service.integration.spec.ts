import { AiItineraryService } from '../src/modules/ai-itinerary/ai.service';

describe('AiItineraryService integration', () => {
  it('runs generate flow and stores output', async () => {
    const repository = {
      getUserBehaviorProfile: jest.fn().mockResolvedValue(null),
      findHotelSuggestions: jest.fn().mockResolvedValue([{ name: 'Hotel Mock', nightlyRate: 100 }]),
      createGenerationLog: jest.fn().mockResolvedValue(undefined),
      createGeneratedPackage: jest.fn().mockResolvedValue({ id: 'ai-1' }),
    };
    const service = new AiItineraryService(
      { buildGeneratePrompt: jest.fn().mockReturnValue({ system: 'sys', user: { destination: 'Bali', travel_dates: { duration_days: 2 } } }) } as any,
      { parseStrict: jest.fn().mockReturnValue({
        title: 'Title', description: 'Long enough description for parser shape.', duration_days: 2,
        itinerary: [{ day: 1, title: 'D1', activities: ['A'], hotel_suggestion: '' }, { day: 2, title: 'D2', activities: ['B'], hotel_suggestion: '' }],
        pricing: { estimated_total: 0, breakdown: { hotel: 0, activities: 0, transfers: 0, margin: 0 } },
        inclusions: ['Hotel'], exclusions: ['Flights'],
      }) } as any,
      repository as any,
      {} as any,
      {} as any,
      {} as any,
    );

    const res = await service.generatePackage('admin-1', {
      destination: 'Bali', durationDays: 2, budgetMin: 500, budgetMax: 2000, travelerType: 'solo', preferences: ['adventure'],
    });

    expect(res.id).toBe('ai-1');
    expect(repository.createGeneratedPackage).toHaveBeenCalled();
    expect(repository.createGenerationLog).toHaveBeenCalled();
  });

  it('converts generated draft to package module', async () => {
    const repository = {
      getGeneratedPackageById: jest.fn().mockResolvedValue({
        id: 'ai-1', status: 'reviewed', inputPayload: { destination: 'Bali', country: 'Indonesia' },
        generatedOutput: {
          title: 'AI Bali', description: 'A generated package description for testing convert flow.', duration_days: 1,
          itinerary: [{ day: 1, title: 'D1', activities: ['A1'], hotel_suggestion: 'Hotel' }],
          pricing: { estimated_total: 100, breakdown: { hotel: 60, activities: 20, transfers: 10, margin: 10 } },
          inclusions: ['Hotel stay'], exclusions: ['Visa'],
        },
      }),
      setPackageAiFlag: jest.fn(),
      markConverted: jest.fn(),
    };
    const packageService = {
      create: jest.fn().mockResolvedValue({ id: 'pkg-1', title: 'AI Bali' }),
      getById: jest.fn().mockResolvedValue({ id: 'pkg-1' }),
    };
    const itineraryService = { create: jest.fn().mockResolvedValue({}) };

    const service = new AiItineraryService({} as any, {} as any, repository as any, packageService as any, itineraryService as any, {} as any);
    const result = await service.convert('ai-1', 'admin-1', { status: 'draft' });

    expect(packageService.create).toHaveBeenCalled();
    expect(itineraryService.create).toHaveBeenCalled();
    expect(repository.markConverted).toHaveBeenCalledWith('ai-1', 'pkg-1');
    expect(result.id).toBe('pkg-1');
  });
});
