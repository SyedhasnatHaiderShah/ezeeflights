import { Injectable } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { AppEventBus } from '../../../common/events/app-event-bus.service';

@Injectable()
export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly events: AppEventBus,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const booking = await this.repository.create(userId, dto);
    this.events.emit('booking.confirmed', {
      userId,
      bookingId: booking.id,
      amount: booking.totalAmount,
      currency: booking.currency,
    });
    return booking;
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  health() {
    return { module: 'booking', status: 'ok' };
  }
}
