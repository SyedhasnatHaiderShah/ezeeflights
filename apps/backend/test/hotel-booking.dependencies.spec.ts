import { Test } from '@nestjs/testing';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { LoyaltyService } from '../src/modules/loyalty/services/loyalty.service';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { PaymentService } from '../src/modules/payment/services/payment.service';
import { ProfileService } from '../src/modules/profile/services/profile.service';
import { UserService } from '../src/modules/user/services/user.service';
import { HotelBookingRepository } from '../src/modules/hotel-booking/repositories/hotel-booking.repository';
import { HotelBookingService } from '../src/modules/hotel-booking/services/hotel-booking.service';

describe('Hotel booking dependency tests', () => {
  it('validates user and profile dependency before create', async () => {
    const userFindOne = jest.fn().mockResolvedValue({ id: 'u1' });
    const listTravelers = jest.fn().mockResolvedValue([{ id: 't1' }]);

    const moduleRef = await Test.createTestingModule({
      providers: [
        HotelBookingService,
        {
          provide: HotelBookingRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'hb1', totalPrice: 100, currency: 'USD', paymentStatus: 'PENDING' }),
            findById: jest.fn().mockResolvedValue({ id: 'hb1', totalPrice: 100, currency: 'USD', paymentStatus: 'PENDING' }),
            markPaymentStatus: jest.fn(),
            listByUser: jest.fn(),
            cancel: jest.fn(),
          },
        },
        { provide: UserService, useValue: { findOne: userFindOne } },
        { provide: NotificationService, useValue: { triggerBookingConfirmed: jest.fn() } },
        { provide: LoyaltyService, useValue: { earnPoints: jest.fn() } },
        { provide: PaymentService, useValue: { createPayment: jest.fn() } },
        { provide: ProfileService, useValue: { listTravelers } },
        { provide: AppEventBus, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    await moduleRef.get(HotelBookingService).create('u1', {
      hotelId: '11111111-1111-1111-1111-111111111111',
      checkInDate: '2026-09-10',
      checkOutDate: '2026-09-12',
      rooms: [{ roomId: '22222222-2222-2222-2222-222222222222', quantity: 1 }],
      guests: [{ fullName: 'Guest', age: 20, type: 'ADULT', roomId: '22222222-2222-2222-2222-222222222222' }],
    });

    expect(userFindOne).toHaveBeenCalledWith('u1');
    expect(listTravelers).toHaveBeenCalledWith('u1');
  });
});
