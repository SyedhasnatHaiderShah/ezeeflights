import { Injectable } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { IdempotencyService } from '../../../common/idempotency/idempotency.service';
import { CircuitBreakerService } from '../../../common/circuit-breaker/circuit-breaker.service';
import { BookingEntity } from '../entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    private readonly repository: BookingRepository,
    private readonly idempotency: IdempotencyService,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async create(userId: string, dto: CreateBookingDto, idempotencyKey: string): Promise<BookingEntity> {
    const cached = await this.idempotency.getCached<BookingEntity>('bookings', idempotencyKey);
    if (cached) {
      return cached;
    }

    const booking = await this.circuitBreaker.execute(
      'sendgrid',
      () => this.repository.create(userId, dto),
      async () => ({
        id: 'fallback',
        userId,
        flightId: dto.flightId ?? null,
        hotelId: dto.hotelId ?? null,
        tripId: dto.tripId ?? null,
        status: 'FAILED',
        totalAmount: dto.totalAmount,
        currency: dto.currency,
        createdAt: new Date(),
      }),
    );

    await this.idempotency.setCached('bookings', idempotencyKey, booking);
    return booking;
  }

  getUserBookings(userId: string) {
    return this.repository.listByUser(userId);
  }

  health() {
    return { module: 'booking', status: 'ok' };
  }
}
