import { BadRequestException, Injectable } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { LoyaltyService } from '../../loyalty/services/loyalty.service';
import { NotificationService } from '../../notification/services/notification.service';
import { PaymentService } from '../../payment/services/payment.service';
import { PaymentProvider } from '../../payment/entities/payment.entity';
import { ProfileService } from '../../profile/services/profile.service';
import { UserService } from '../../user/services/user.service';
import { CreateHotelBookingDto } from '../dto/create-hotel-booking.dto';
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

  async create(userId: string, dto: CreateHotelBookingDto) {
    await this.userService.findOne(userId);

    const savedTravelers = await this.profileService.listTravelers(userId);
    if (savedTravelers.length > 0 && dto.guests.length === 0) {
      throw new BadRequestException('At least one guest is required');
    }

    const booking = await this.repository.create(userId, dto);

    if (dto.paymentProvider) {
      if (process.env.ENABLE_LEGACY_PAYMENT_BRIDGE === 'true') {
        await this.paymentService.createPayment({
          bookingId: booking.id,
          userId,
          amount: booking.totalPrice,
          currency: booking.currency as 'USD' | 'AED' | 'EUR' | 'GBP',
          provider: dto.paymentProvider as PaymentProvider,
        });
      }
      await this.repository.markPaymentStatus(booking.id, 'PAID');
    }

    const refreshed = await this.repository.findById(booking.id, userId);

    if (refreshed.paymentStatus === 'PAID') {
      await this.loyaltyService.earnPoints(userId, refreshed.totalPrice, refreshed.id);
      this.events.emit('booking.confirmed', {
        userId,
        bookingId: refreshed.id,
        amount: refreshed.totalPrice,
        currency: refreshed.currency,
      });
    }

    await this.notificationService.triggerBookingConfirmed(userId, {
      bookingId: refreshed.id,
      module: 'HOTEL',
      amount: refreshed.totalPrice,
      checkInDate: refreshed.checkInDate,
      checkOutDate: refreshed.checkOutDate,
    });

    return refreshed;
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
    return this.repository.cancel(id, userId);
  }
}
