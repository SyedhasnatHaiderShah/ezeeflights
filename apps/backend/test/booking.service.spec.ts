import { Test } from '@nestjs/testing';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { BookingRepository } from '../src/modules/booking/repositories/booking.repository';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { UserService } from '../src/modules/user/services/user.service';
import { ProfileService } from '../src/modules/profile/services/profile.service';

describe('BookingService', () => {
  it('creates booking and emits event on confirmed status', async () => {
    const emit = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: BookingRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'b1', status: 'CONFIRMED', totalAmount: 333, currency: 'USD' }),
            findById: jest.fn(),
            listByUser: jest.fn(),
            cancel: jest.fn(),
          },
        },
        { provide: AppEventBus, useValue: { emit } },
        { provide: UserService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'u1' }) } },
        { provide: ProfileService, useValue: { listTravelers: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    const service = moduleRef.get(BookingService);
    await service.create('u1', {
      flightIds: ['f1'],
      passengers: [{ fullName: 'John', passportNumber: 'P1', seatNumber: '11A', type: 'ADULT' }],
      paymentStatus: 'PAID',
    });

    expect(emit).toHaveBeenCalledWith('booking.confirmed', expect.objectContaining({ bookingId: 'b1' }));
  });
});
