import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AnalyticsEventInput, AnalyticsRepository } from './analytics.repository';

export type TrackingEventName = 'flight_search' | 'hotel_search' | 'booking_created' | 'payment_success' | 'booking_cancelled';

interface TrackInput {
  userId?: string | null;
  eventName: TrackingEventName;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

@Injectable()
export class EventTrackerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventTrackerService.name);
  private readonly queue: AnalyticsEventInput[] = [];
  private timer: NodeJS.Timeout | null = null;
  private flushing = false;

  constructor(private readonly repository: AnalyticsRepository) {}

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.flush();
    }, 1000);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  track(payload: TrackInput): void {
    const mapped = this.mapEvent(payload);
    this.queue.push(mapped);

    if (this.queue.length >= 100) {
      setImmediate(() => {
        void this.flush();
      });
    }
  }

  async flush(): Promise<void> {
    if (this.flushing || this.queue.length === 0) return;
    this.flushing = true;

    const batch = this.queue.splice(0, 500);
    try {
      const deduped = this.dedupeBatch(batch);
      await this.repository.insertEvents(deduped);
    } catch (error) {
      this.logger.error('Failed to flush analytics events', error as Error);
    } finally {
      this.flushing = false;
    }
  }

  private dedupeBatch(batch: AnalyticsEventInput[]) {
    const seen = new Set<string>();
    const deduped: AnalyticsEventInput[] = [];

    for (const event of batch) {
      const key = `${event.userId ?? 'anon'}:${event.eventType}:${JSON.stringify(event.metadata)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(event);
    }

    return deduped;
  }

  private mapEvent(payload: TrackInput): AnalyticsEventInput {
    const eventType: AnalyticsEventInput['eventType'] =
      payload.eventName === 'booking_created'
        ? 'BOOK'
        : payload.eventName === 'payment_success'
          ? 'PAYMENT'
          : payload.eventName === 'booking_cancelled'
            ? 'VIEW'
            : 'SEARCH';

    return {
      userId: payload.userId ?? null,
      eventType,
      metadata: payload.metadata ?? {},
      createdAt: payload.createdAt,
    };
  }
}
