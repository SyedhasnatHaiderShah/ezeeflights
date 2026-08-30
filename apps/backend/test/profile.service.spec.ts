import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProfileService } from '../src/modules/profile/services/profile.service';
import { ProfileRepository } from '../src/modules/profile/repositories/profile.repository';
import { UserService } from '../src/modules/user/services/user.service';
import { BookingService } from '../src/modules/booking/services/booking.service';

describe('ProfileService', () => {
  it('prevents duplicate traveler passport', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: ProfileRepository, useValue: { findTravelerByPassport: jest.fn().mockResolvedValue({ id: 't1' }) } },
        { provide: UserService, useValue: { getProfile: jest.fn(), findOne: jest.fn() } },
        { provide: BookingService, useValue: { getUserBookings: jest.fn() } },
      ],
    }).compile();

    await expect(
      moduleRef.get(ProfileService).addTraveler('u1', {
        fullName: 'Test Traveler',
        passportNumber: 'ABC1234',
        dob: '1995-01-01',
        nationality: 'US',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
