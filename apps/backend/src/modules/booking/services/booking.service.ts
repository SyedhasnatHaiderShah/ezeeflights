import { BadRequestException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { ProfileService } from '../../profile/services/profile.service';
import { UserService } from '../../user/services/user.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingRepository } from '../repositories/booking.repository';

@Injectable()
export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly events: AppEventBus,
    private readonly userService: UserService,
    @Inject(forwardRef(() => ProfileService))
    private readonly profileService: ProfileService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    await this.userService.findOne(userId);

    const travelers = await this.profileService.listTravelers(userId);
    const travelerMap = new Map(travelers.map((traveler) => [traveler.id, traveler]));

    const hydratedPassengers = dto.passengers.map((passenger) => {
      if (!passenger.savedTravelerId) {
        return passenger;
      }
      const traveler = travelerMap.get(passenger.savedTravelerId);
      if (!traveler) {
        throw new BadRequestException(`Saved traveler not found: ${passenger.savedTravelerId}`);
      }
      return {
        ...passenger,
        fullName: traveler.fullName,
        passportNumber: traveler.passportNumber,
      };
    });

    const booking = await this.repository.create(userId, { ...dto, passengers: hydratedPassengers });

    if (booking.status === 'CONFIRMED') {
      this.events.emit('booking.confirmed', {
        userId,
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
      });
    }

    return booking;
  }

  getById(id: string, userId: string) {
    return this.repository.findById(id, userId);
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  async cancelBooking(id: string, userId: string) {
    const before = await this.repository.findById(id, userId);
    if (before.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }
    return this.repository.cancel(id, userId);
  }

  health() {
    return { module: 'booking', status: 'ok' };
  }
}
