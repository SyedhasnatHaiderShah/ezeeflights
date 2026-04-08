import { AiRecommendationService } from '../src/modules/destinations/ai.recommendation.service';

describe('AI ranking logic', () => {
  it('ranks matching categories higher', async () => {
    const repo = {
      listUserContext: jest.fn().mockResolvedValue({ preferences: { interests: ['museum'] }, wishlistCategories: [], pastDestinations: [] }),
      listAttractions: jest.fn().mockResolvedValue({ data: [
        { id: 'a1', name: 'Museum A', category: 'museum', rating: 4.4, totalReviews: 300 },
        { id: 'a2', name: 'Beach B', category: 'beach', rating: 4.8, totalReviews: 900 },
      ] }),
    } as any;

    const service = new AiRecommendationService(repo);
    const ranked = await service.rankForUser('u1', 'dubai');
    expect(ranked[0].category).toBe('museum');
  });
});
