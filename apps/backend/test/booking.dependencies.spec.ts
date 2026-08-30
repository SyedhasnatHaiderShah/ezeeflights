import { Test } from '@nestjs/testing';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { BookingRepository } from '../src/modules/booking/repositories/booking.repository';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { UserService } from '../src/modules/user/services/user.service';
import { ProfileService } from '../src/modules/profile/services/profile.service';

describe('Booking dependency tests', () => {
  it('auth/user dependency: service validates user before booking creation', async () => {
    const userFindOne = jest.fn().mockResolvedValue({ id: 'u1' });
    const moduleRef = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'b1', status: 'PENDING', totalAmount: 100, currency: 'USD' }),
            findById: jest.fn(),
            listByUser: jest.fn(),
            cancel: jest.fn(),
          },
        },
        { provide: AppEventBus, useValue: { emit: jest.fn() } },
        { provide: UserService, useValue: { findOne: userFindOne } },
        { provide: ProfileService, useValue: { listTravelers: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    await moduleRef.get(BookingService).create('u1', {
      flightIds: ['f1'],
      passengers: [{ fullName: 'A', passportNumber: 'P', seatNumber: '1A', type: 'ADULT' }],
    });

    expect(userFindOne).toHaveBeenCalledWith('u1');
  });
});
