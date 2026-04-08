import { BadRequestException } from '@nestjs/common';
import { DestinationRepository } from '../src/modules/destinations/destination.repository';

describe('Wishlist logic', () => {
  it('prevents duplicate entries', async () => {
    const repo = new DestinationRepository({ queryOne: jest.fn().mockResolvedValue(null) } as any);
    await expect(repo.addWishlist('u1', 'a1')).rejects.toBeInstanceOf(BadRequestException);
  });
});
