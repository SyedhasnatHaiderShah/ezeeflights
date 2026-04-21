import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { NotificationService } from '../../notification/services/notification.service';
import { PaymentService } from '../../payment/services/payment.service';
import { ProfileService } from '../../profile/services/profile.service';
import { UserService } from '../../user/services/user.service';
import { CreateHotelBookingDto } from '../dto/create-hotel-booking.dto';
import { ConfirmHotelPaymentDto, InitiateHotelPaymentDto } from '../dto/hotel-payment.dto';
import { HotelBookingRepository } from '../repositories/hotel-booking.repository';

@Injectable()
export class HotelBookingService {
  constructor(
    private readonly repository: HotelBookingRepository,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly loyaltyService: LoyaltyService,
    private readonly paymentService: PaymentService,
    private readonly profileService: ProfileService,
    private readonly events: AppEventBus,
  ) {}

  /**
   * Create a hotel booking in PENDING / PENDING payment state.
   * The caller must then call initiatePayment() → frontend confirms →
   * confirmPayment() to transition the booking to CONFIRMED / PAID.
   */
  async create(userId: string, dto: CreateHotelBookingDto) {
    await this.userService.findOne(userId);

    const savedTravelers = await this.profileService.listTravelers(userId);
    if (savedTravelers.length > 0 && dto.guests.length === 0) {
      throw new BadRequestException('At least one guest is required');
    }

    // Booking is created with status=PENDING, payment_status=PENDING
    return this.repository.create(userId, dto);
  }

  /**
   * Create a provider PaymentIntent for a pending hotel booking.
   * Returns { clientSecret, paymentIntentId } so the frontend can confirm
   * payment using the provider's SDK (e.g. Stripe.js).
   */
  async initiatePayment(bookingId: string, userId: string, dto: InitiateHotelPaymentDto) {
    const booking = await this.repository.findById(bookingId, userId);

    if (booking.paymentStatus === 'PAID') {
      throw new BadRequestException('This booking has already been paid');
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled booking');
    }

    const { clientSecret, paymentIntentId } = await this.paymentService.createExternalPaymentIntent(
      booking.totalPrice,
      booking.currency,
      dto.provider,
      { bookingType: 'hotel', bookingId: booking.id, userId },
    );

    // Persist the intent id so confirmPayment can verify it matches
    await this.repository.storePaymentIntentId(bookingId, paymentIntentId);

    return {
      bookingId,
      clientSecret,
      paymentIntentId,
      amount: booking.totalPrice,
      currency: booking.currency,
    };
  }

  /**
   * Confirm that the provider has successfully charged the customer.
   * Verifies the PaymentIntent status via the provider API, then marks
   * the booking as PAID / CONFIRMED and fires downstream side-effects.
   */
  async confirmPayment(bookingId: string, userId: string, dto: ConfirmHotelPaymentDto) {
    const booking = await this.repository.findById(bookingId, userId);

    if (booking.paymentStatus === 'PAID') {
      throw new BadRequestException('This booking has already been paid');
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Cannot confirm payment for a cancelled booking');
    }

    // Guard: the paymentIntentId must match the one we issued
    if (booking.paymentIntentId && booking.paymentIntentId !== dto.paymentIntentId) {
      throw new BadRequestException('Payment intent id does not match the one issued for this booking');
    }

    const succeeded = await this.paymentService.verifyExternalPaymentIntent(dto.paymentIntentId, dto.provider);
    if (!succeeded) {
      await this.repository.markPaymentStatus(bookingId, 'FAILED');
      throw new BadRequestException('Payment has not been completed by the provider');
    }

    await this.repository.markPaymentStatus(bookingId, 'PAID');
    const confirmed = await this.repository.findById(bookingId, userId);

    // Earn loyalty points (fire-and-forget, do not block response)
    this.loyaltyService.earnPoints(userId, confirmed.totalPrice, confirmed.id).catch(() => undefined);

    // Broadcast event for any subscribers (analytics, audit, etc.)
    this.events.emit('booking.confirmed', {
      userId,
      bookingId: confirmed.id,
      amount: confirmed.totalPrice,
      currency: confirmed.currency,
    });

    // Send confirmation notification asynchronously
    this.notificationService
      .triggerBookingConfirmed(userId, {
        bookingId: confirmed.id,
        module: 'HOTEL',
        amount: confirmed.totalPrice,
        checkInDate: confirmed.checkInDate,
        checkOutDate: confirmed.checkOutDate,
      })
      .catch(() => undefined);

    return confirmed;
  }

  getById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  async cancel(id: string, userId: string) {
    const current = await this.repository.findById(id, userId);
    if (current.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (current.paymentStatus === 'PAID') {
      throw new BadRequestException('Paid bookings must be refunded before cancellation');
    }
    return this.repository.cancel(id, userId);
  }
}
