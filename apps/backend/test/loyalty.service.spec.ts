import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LoyaltyService } from '../src/modules/loyalty/services/loyalty.service';
import { LoyaltyRepository } from '../src/modules/loyalty/repositories/loyalty.repository';
import { AppEventBus } from '../src/common/events/app-event-bus.service';

describe('LoyaltyService', () => {
  it('rejects redeem larger than balance', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: LoyaltyRepository,
          useValue: {
            getOrCreateAccount: jest.fn().mockResolvedValue({ id: 'a1', pointsBalance: 50, tier: 'BRONZE' }),
            expirePoints: jest.fn().mockResolvedValue(0),
            findAccountById: jest.fn().mockResolvedValue({ id: 'a1', pointsBalance: 50, tier: 'BRONZE' }),
          },
        },
        { provide: AppEventBus, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    await expect(moduleRef.get(LoyaltyService).redeemPoints('u1', 100)).rejects.toBeInstanceOf(BadRequestException);
  });
});
