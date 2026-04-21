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
  const pendingBooking = {
    id: 'hb1',
    totalPrice: 320,
    currency: 'USD',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    paymentIntentId: null,
  };
  const confirmedBooking = { ...pendingBooking, paymentStatus: 'PAID', status: 'CONFIRMED', paymentIntentId: 'pi_test' };

  let service: HotelBookingService;
  let repository: jest.Mocked<Partial<HotelBookingRepository>>;
  let paymentService: { createExternalPaymentIntent: jest.Mock; verifyExternalPaymentIntent: jest.Mock };
  let loyaltyEarn: jest.Mock;
  let notification: jest.Mock;

  beforeEach(async () => {
    loyaltyEarn = jest.fn().mockResolvedValue(undefined);
    notification = jest.fn().mockResolvedValue(undefined);
    paymentService = {
      createExternalPaymentIntent: jest.fn().mockResolvedValue({ clientSecret: 'cs_test', paymentIntentId: 'pi_test' }),
      verifyExternalPaymentIntent: jest.fn().mockResolvedValue(true),
    };

    repository = {
      create: jest.fn().mockResolvedValue(pendingBooking),
      storePaymentIntentId: jest.fn().mockResolvedValue(undefined),
      markPaymentStatus: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn()
        .mockResolvedValueOnce(pendingBooking)  // called by initiatePayment
        .mockResolvedValueOnce({ ...pendingBooking, paymentIntentId: 'pi_test' }) // called by confirmPayment (pre-check)
        .mockResolvedValueOnce(confirmedBooking), // called by confirmPayment (post-mark)
      listByUser: jest.fn(),
      cancel: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        HotelBookingService,
        { provide: HotelBookingRepository, useValue: repository },
        { provide: UserService, useValue: { findOne: jest.fn().mockResolvedValue({ id: 'u1' }) } },
        { provide: NotificationService, useValue: { triggerBookingConfirmed: notification } },
        { provide: LoyaltyService, useValue: { earnPoints: loyaltyEarn } },
        { provide: PaymentService, useValue: paymentService },
        { provide: ProfileService, useValue: { listTravelers: jest.fn().mockResolvedValue([]) } },
        { provide: AppEventBus, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(HotelBookingService);
  });

  it('create() returns a PENDING booking without charging anything', async () => {
    const result = await service.create('u1', {
      hotelId: '11111111-1111-1111-1111-111111111111',
      checkInDate: '2026-09-10',
      checkOutDate: '2026-09-12',
      rooms: [{ roomId: '22222222-2222-2222-2222-222222222222', quantity: 1 }],
      guests: [{ fullName: 'Jane', age: 31, type: 'ADULT', roomId: '22222222-2222-2222-2222-222222222222' }],
    });

    expect(result.paymentStatus).toBe('PENDING');
    expect(paymentService.createExternalPaymentIntent).not.toHaveBeenCalled();
    expect(loyaltyEarn).not.toHaveBeenCalled();
  });

  it('initiatePayment() creates a PaymentIntent and stores the id', async () => {
    const result = await service.initiatePayment('hb1', 'u1', { provider: 'STRIPE' });

    expect(paymentService.createExternalPaymentIntent).toHaveBeenCalledWith(
      320, 'USD', 'STRIPE', expect.objectContaining({ bookingType: 'hotel', bookingId: 'hb1' }),
    );
    expect(repository.storePaymentIntentId).toHaveBeenCalledWith('hb1', 'pi_test');
    expect(result.clientSecret).toBe('cs_test');
    expect(result.paymentIntentId).toBe('pi_test');
  });

  it('confirmPayment() verifies the intent, marks PAID, and fires side-effects', async () => {
    const result = await service.confirmPayment('hb1', 'u1', { paymentIntentId: 'pi_test', provider: 'STRIPE' });

    expect(paymentService.verifyExternalPaymentIntent).toHaveBeenCalledWith('pi_test', 'STRIPE');
    expect(repository.markPaymentStatus).toHaveBeenCalledWith('hb1', 'PAID');
    expect(result.paymentStatus).toBe('PAID');
  });

  it('confirmPayment() throws if the PaymentIntent was not completed', async () => {
    paymentService.verifyExternalPaymentIntent.mockResolvedValueOnce(false);

    await expect(
      service.confirmPayment('hb1', 'u1', { paymentIntentId: 'pi_test', provider: 'STRIPE' }),
    ).rejects.toThrow('Payment has not been completed by the provider');
  });
});
