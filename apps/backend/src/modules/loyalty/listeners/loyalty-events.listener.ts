import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { LoyaltyService } from '../services/loyalty.service';

@Injectable()
export class LoyaltyEventsListener implements OnModuleInit {
  constructor(
    private readonly events: AppEventBus,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  onModuleInit(): void {
    this.events.on<{ userId: string; bookingId: string; amount: number; bookingType?: 'flight' | 'hotel' | 'car' | 'package'; currency?: string }>(
      'booking.confirmed',
      async (event) => {
        await this.loyaltyService.earnPoints(
          event.userId,
          event.bookingType ?? 'flight',
          event.amount,
          event.currency ?? 'USD',
          event.bookingId,
        );
      },
    );
  }
}
