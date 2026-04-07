import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppEventBus } from '../../common/events/app-event-bus.service';
import { PostgresClient } from '../../database/postgres.client';
import { AnalyticsRepository } from './analytics.repository';
import { EventTrackerService } from './eventTracker.service';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private aggregateTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly tracker: EventTrackerService,
    private readonly db: PostgresClient,
    private readonly eventBus: AppEventBus,
  ) {}

  onModuleInit(): void {
    this.registerEventListeners();

    this.aggregateTimer = setInterval(() => {
      void this.aggregateDaily();
    }, 5 * 60 * 1000);
  }

  onModuleDestroy(): void {
    if (this.aggregateTimer) clearInterval(this.aggregateTimer);
  }

  async getRevenue(range: 'daily' | 'weekly' | 'monthly', from?: string, to?: string) {
    const data = await this.repository.getRevenue(range, from, to);
    return { range, from: from ?? null, to: to ?? null, data };
  }

  async getBookings(from?: string, to?: string) {
    const metrics = await this.repository.getBookingMetrics(from, to);
    return metrics ?? { totalBookings: 0, cancellations: 0, successfulBookings: 0, successRate: 0 };
  }

  async getFunnel(from?: string, to?: string) {
    return this.repository.getFunnel(from, to);
  }

  async getUserBehavior(from?: string, to?: string) {
    return this.repository.getUserBehavior(from, to);
  }

  trackEvent(payload: Parameters<EventTrackerService['track']>[0]) {
    this.tracker.track(payload);
    return { accepted: true };
  }

  async aggregateDaily(targetDate?: string) {
    await this.syncAnalyticsBookings(targetDate);
    await this.repository.rebuildDailyAggregates(targetDate);
  }

  private registerEventListeners() {
    this.eventBus.on<{ userId?: string; query?: string }>('flight.search', (event) => {
      this.tracker.track({ eventName: 'flight_search', userId: event.userId, metadata: { query: event.query } });
    });

    this.eventBus.on<{ userId?: string; query?: string }>('hotel.search', (event) => {
      this.tracker.track({ eventName: 'hotel_search', userId: event.userId, metadata: { query: event.query } });
    });

    this.eventBus.on<{ bookingId: string; userId: string; totalAmount: number; currency: string }>('booking.created', (event) => {
      this.tracker.track({
        eventName: 'booking_created',
        userId: event.userId,
        metadata: { bookingId: event.bookingId, amount: event.totalAmount, currency: event.currency },
      });
      void this.repository.insertBookingSnapshot({
        bookingId: event.bookingId,
        userId: event.userId,
        amount: event.totalAmount,
        currency: event.currency,
        status: 'PENDING',
      });
    });

    this.eventBus.on<{ bookingId: string; userId: string; amount: number; currency: string }>('payment.success', (event) => {
      this.tracker.track({
        eventName: 'payment_success',
        userId: event.userId,
        metadata: { bookingId: event.bookingId, amount: event.amount, currency: event.currency },
      });
      void this.repository.insertBookingSnapshot({
        bookingId: event.bookingId,
        userId: event.userId,
        amount: event.amount,
        currency: event.currency,
        status: 'CONFIRMED',
      });
    });

    this.eventBus.on<{ bookingId: string; userId: string }>('booking.cancelled', (event) => {
      this.tracker.track({ eventName: 'booking_cancelled', userId: event.userId, metadata: { bookingId: event.bookingId } });
    });
  }

  private async syncAnalyticsBookings(targetDate?: string): Promise<void> {
    await this.db.query(
      `INSERT INTO analytics_bookings (booking_id, user_id, amount, currency, status, created_at)
       SELECT b.id, b.user_id, b.total_amount, b.currency, b.status, b.created_at
       FROM bookings b
       WHERE ($1::date IS NULL OR b.created_at::date = $1::date)
       ON CONFLICT (booking_id) DO UPDATE
       SET user_id = EXCLUDED.user_id,
           amount = EXCLUDED.amount,
           currency = EXCLUDED.currency,
           status = EXCLUDED.status,
           created_at = LEAST(analytics_bookings.created_at, EXCLUDED.created_at)`,
      [targetDate ?? null],
    );
  }
}
