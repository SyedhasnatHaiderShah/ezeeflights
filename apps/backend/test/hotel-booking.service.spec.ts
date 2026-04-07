import { Test } from '@nestjs/testing';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { LoyaltyService } from '../src/modules/loyalty/services/loyalty.service';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { PaymentService } from '../src/modules/payment/services/payment.service';
import { ProfileService } from '../src/modules/profile/services/profile.service';
import { UserService } from '../src/modules/user/services/user.service';
import { HotelBookingRepository } from '../src/modules/hotel-booking/repositories/hotel-booking.repository';
import { HotelBookingService } from '../src/modules/hotel-booking/services/hotel-booking.service';

describe('HotelBookingService', () => {
  it('creates a booking and triggers dependencies', async () => {
    process.env.ENABLE_LEGACY_PAYMENT_BRIDGE = 'true';
    const loyaltyEarn = jest.fn();
    const paymentCreate = jest.fn().mockResolvedValue({ id: 'p1' });
    const notification = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        HotelBookingService,
        {
          provide: HotelBookingRepository,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'hb1', totalPrice: 320, currency: 'USD', paymentStatus: 'PENDING' }),
            markPaymentStatus: jest.fn().mockResolvedValue(undefined),
            findById: jest.fn().mockResolvedValue({ id: 'hb1', totalPrice: 320, currency: 'USD', paymentStatus: 'PAID' }),
            listByUser: jest.fn(),
            cancel: jest.fn(),
          },
        },
        { provide: UserService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'u1' }) } },
        { provide: NotificationService, useValue: { triggerBookingConfirmed: notification } },
        { provide: LoyaltyService, useValue: { earnPoints: loyaltyEarn } },
        { provide: PaymentService, useValue: { createPayment: paymentCreate } },
        { provide: ProfileService, useValue: { listTravelers: jest.fn().mockResolvedValue([]) } },
        { provide: AppEventBus, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    const service = moduleRef.get(HotelBookingService);
    await service.create('u1', {
      hotelId: '11111111-1111-1111-1111-111111111111',
      checkInDate: '2026-09-10',
      checkOutDate: '2026-09-12',
      rooms: [{ roomId: '22222222-2222-2222-2222-222222222222', quantity: 1 }],
      guests: [{ fullName: 'Jane', age: 31, type: 'ADULT', roomId: '22222222-2222-2222-2222-222222222222' }],
      paymentProvider: 'mock',
    });

    expect(paymentCreate).toHaveBeenCalled();
    expect(loyaltyEarn).toHaveBeenCalledWith('u1', 320, 'hb1');
    expect(notification).toHaveBeenCalled();
    delete process.env.ENABLE_LEGACY_PAYMENT_BRIDGE;
  });
});
