import { BadRequestException } from '@nestjs/common';
import { DestinationRepository } from '../src/modules/destinations/destination.repository';

describe('Geo queries', () => {
  it('rejects invalid coordinates', async () => {
    const repo = new DestinationRepository({ query: jest.fn() } as any);
    await expect(repo.nearbyByGeo({ latitude: 120, longitude: 10, radiusKm: 5, zoom: 8 })).rejects.toBeInstanceOf(BadRequestException);
  });
});
