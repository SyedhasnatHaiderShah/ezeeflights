import { Injectable } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(private readonly repository: BookingRepository) {}

  create(userId: string, dto: CreateBookingDto) {
    return this.repository.create(userId, dto);
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  health() {
    return { module: 'booking', status: 'ok' };
  }
}
