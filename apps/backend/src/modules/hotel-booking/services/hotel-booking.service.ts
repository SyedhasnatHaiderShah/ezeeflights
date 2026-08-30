import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { NotificationService } from '../../notification/services/notification.service';
import { PaymentService } from '../../payment/services/payment.service';
import { ProfileService } from '../../profile/services/profile.service';
import { UserService } from '../../user/services/user.service';
import { BookingProviderService } from '../../integrations/booking-provider.service';
import { CurrencyService } from '../../public/currency.service';
import { CreateHotelBookingDto } from '../dto/create-hotel-booking.dto';
import { joinGuestFullName } from '../utils/guest-name.util';
import { ConfirmHotelPaymentDto, InitiateHotelPaymentDto } from '../dto/hotel-payment.dto';
import { HotelBookingRepository } from '../repositories/hotel-booking.repository';

@Injectable()
export class HotelBookingService {
  constructor(
    private readonly repository: HotelBookingRepository,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentService,
    private readonly profileService: ProfileService,
    private readonly bookingProvider: BookingProviderService,
    private readonly currencyService: CurrencyService,
    private readonly events: AppEventBus,
  ) { }

  /**
   * Create a hotel booking in PENDING / PENDING payment state.
   * Payment is collected manually after confirmation; no online gateway step.
   */
  async create(userId: string, dto: CreateHotelBookingDto) {
    console.log('[HOTEL_BOOKING_DEBUG] Starting booking creation', { userId, dto });
    try {
      const user = await this.userService.findOne(userId);
      console.log('[HOTEL_BOOKING_DEBUG] Found user preferred currency', user?.preferredCurrency);

      const payload: CreateHotelBookingDto = {
        ...dto,
        displayCurrency: dto.displayCurrency ?? user.preferredCurrency,
      };

      const savedTravelers = await this.profileService.listTravelers(userId);
      console.log('[HOTEL_BOOKING_DEBUG] Saved travelers list size', savedTravelers.length);

      if (savedTravelers.length > 0 && payload.guests.length === 0) {
        console.warn('[HOTEL_BOOKING_DEBUG] Guest validation failed - saved travelers exist but guest list empty');
        throw new BadRequestException('At least one guest is required');
      }

      console.log('[HOTEL_BOOKING_DEBUG] Fetching hotel details from provider', {
        hotelId: payload.hotelId,
        checkInDate: payload.checkInDate,
        checkOutDate: payload.checkOutDate,
        city: payload.city,
      });

      const hotel: any = await this.bookingProvider.getHotelDetails(
        payload.hotelId,
        payload.checkInDate,
        payload.checkOutDate,
        payload.city,
      );
      
      console.log('[HOTEL_BOOKING_DEBUG] Hotel details result from provider', {
        found: !!hotel,
        name: hotel?.name,
        currency: hotel?.currency,
        roomsCount: hotel?.rooms?.length,
      });

      if (!hotel) {
        throw new NotFoundException('Hotel not found from provider');
      }

      const displayCurrency = payload.displayCurrency || user.preferredCurrency || 'USD';
      const sourceCurrency = hotel.currency || 'USD';
      console.log('[HOTEL_BOOKING_DEBUG] Currency resolution:', { sourceCurrency, displayCurrency });

      if (sourceCurrency !== displayCurrency) {
        console.log('[HOTEL_BOOKING_DEBUG] Converting room prices from source to display currency');
        if (hotel.rooms) {
          for (const room of hotel.rooms) {
            if (room.pricePerNight) {
              const originalPrice = room.pricePerNight;
              room.pricePerNight = await this.currencyService.convertAmount(
                room.pricePerNight, 
                sourceCurrency, 
                displayCurrency
              );
              console.log('[HOTEL_BOOKING_DEBUG] Converted room price', {
                roomId: room.id,
                original: originalPrice,
                converted: room.pricePerNight,
              });
            }
          }
        }
        hotel.currency = displayCurrency;
      }
      
      hotel.defaultCurrency = 'USD'; // Ensure repository knows the baseline is USD

      console.log('[HOTEL_BOOKING_DEBUG] Inserting booking into repository...');
      const booking = await this.repository.create(userId, payload, hotel);
      console.log('[HOTEL_BOOKING_DEBUG] Repository created booking successfully', { bookingId: booking.id });

      this.sendBookingConfirmationEmail(userId, booking, hotel, payload).catch((e) => {
        console.error('[HOTEL_BOOKING_DEBUG] Async sendBookingConfirmationEmail failed', e);
      });

      return {
        ...booking,
        bookingId: booking.id,
        currency: booking.currency,
        defaultCurrency: booking.defaultCurrency ?? 'USD',
        hotelName: hotel.name ?? payload.hotelId,
        hotelAddress: hotel.address ?? [hotel.city, hotel.country].filter(Boolean).join(', '),
      };
    } catch (error: any) {
      console.error('[HOTEL_BOOKING_DEBUG] Exception caught in create method:', {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private async sendBookingConfirmationEmail(
    userId: string,
    booking: {
      id: string;
      totalPrice: number;
      currency: string;
      defaultCurrency?: string;
      checkInDate: string;
      checkOutDate: string;
    },
    hotel: { name?: string; address?: string; city?: string; country?: string },
    dto: CreateHotelBookingDto,
  ): Promise<void> {
    const formatDate = (value: string) => {
      try {
        return new Date(value).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return value;
      }
    };

    const hotelName = hotel.name ?? dto.hotelId;
    const location = [hotel.city, hotel.country].filter(Boolean).join(', ');
    const guestNames = dto.guests.map((g) => joinGuestFullName(g)).join(', ');
    const bookingCurrency = (booking.currency || 'USD').toUpperCase();
    const bookingDefaultCurrency = booking.defaultCurrency
      ? booking.defaultCurrency.toUpperCase()
      : bookingCurrency;

    const user = await this.userService.findOne(userId);
    const displayCurrency = (
      dto.displayCurrency ||
      user?.preferredCurrency ||
      bookingCurrency
    ).toUpperCase();

    const displayTotalPrice = await this.currencyService.convertAmount(
      booking.totalPrice,
      bookingCurrency,
      displayCurrency,
    );
    const currencySymbol = this.currencyService.getSymbol(displayCurrency);
    const formattedDisplayTotal = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: ["USD", "EUR", "GBP"].includes(displayCurrency) ? 2 : 0,
    }).format(displayTotalPrice);
    
    const originalPriceNote =
      displayCurrency !== bookingCurrency
        ? `Hotel rate: ${bookingCurrency} ${Math.round(booking.totalPrice).toLocaleString('en-US')}`
        : '';

    await this.notificationService.triggerBookingConfirmed(userId, {
      module: 'HOTEL',
      bookingRef: booking.id,
      totalPrice: booking.totalPrice,
      currency: bookingCurrency,
      defaultCurrency: bookingDefaultCurrency,
      displayCurrency,
      displayTotalPrice: formattedDisplayTotal,
      currencySymbol,
      originalPriceNote,
      checkInDate: formatDate(booking.checkInDate),
      checkOutDate: formatDate(booking.checkOutDate),
      hotelName,
      guestNames,
      email: dto.contactEmail,
      phone: dto.contactPhone,
      hotelDetails: [
        hotelName,
        location || dto.city,
        hotel.address,
      ]
        .filter(Boolean)
        .join(' · '),
    });
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

    // Attempt to book with external provider (Travelport)
    try {
      const providerBooking = await this.bookingProvider.createReservation(booking, booking.guests ?? []);
      // In a real scenario, we might check if `providerBooking.success` is false 
      // and handle failure by refunding the payment.
    } catch (err) {
      // In a real scenario, we would trigger a manual review or automatic refund
      console.error("External booking provider failed to create reservation", err);
    }

    await this.repository.markPaymentStatus(bookingId, 'PAID');
    const confirmed = await this.repository.findById(bookingId, userId);

    // Broadcast event for any subscribers (analytics, audit, etc.)
    this.events.emit('booking.confirmed', {
      userId,
      bookingId: confirmed.id,
      amount: confirmed.totalPrice,
      currency: confirmed.currency,
      defaultCurrency: confirmed.defaultCurrency,
      bookingType: 'hotel',
    });

    // Send confirmation notification asynchronously
    const firstGuest = confirmed.guests?.[0];
    const guestNames = confirmed.guests?.map(g => g.fullName).join(', ') || '';

    this.notificationService
      .triggerBookingConfirmed(userId, {
        bookingRef: confirmed.id,
        module: 'HOTEL',
        totalPrice: confirmed.totalPrice,
        currency: confirmed.currency || 'USD',
        defaultCurrency: confirmed.defaultCurrency || confirmed.currency || 'USD',
        checkInDate: confirmed.checkInDate,
        checkOutDate: confirmed.checkOutDate,
        hotelName: confirmed.hotelName,
        guestNames,
        email: firstGuest?.email,
        phone: firstGuest?.phone,
      })
      .catch(() => undefined);

    return confirmed;
  }

  async getById(id: string, userId: string) {
    const booking = await this.repository.findById(id, userId);
    try {
      const hotel: any = await this.bookingProvider.getHotelDetails(
        booking.hotelId,
        booking.checkInDate,
        booking.checkOutDate,
      );
      return {
        ...booking,
        hotelName: hotel?.name ?? booking.hotelId,
        hotelAddress: hotel?.address ?? [hotel?.city, hotel?.country].filter(Boolean).join(', '),
      };
    } catch {
      return {
        ...booking,
        hotelName: booking.hotelId,
        hotelAddress: undefined,
      };
    }
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
