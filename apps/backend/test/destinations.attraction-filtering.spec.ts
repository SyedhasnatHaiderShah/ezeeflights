import { DestinationRepository } from '../src/modules/destinations/destination.repository';

describe('Attraction filtering', () => {
  it('applies category, rating and geo filters', async () => {
    const db = {
      query: jest.fn().mockResolvedValue([]),
      queryOne: jest.fn().mockResolvedValue({ total: '0' }),
    } as any;
    const repo = new DestinationRepository(db);

    await repo.listAttractions({ city: 'dubai', category: 'museum', rating: 4.3, latitude: 25.2, longitude: 55.2, distanceKm: 5, page: 1, limit: 10 });

    expect(db.query).toHaveBeenCalled();
    const querySql: string = db.query.mock.calls[0][0];
    expect(querySql).toContain('a.category');
    expect(querySql).toContain('ST_DWithin');
  });
});
