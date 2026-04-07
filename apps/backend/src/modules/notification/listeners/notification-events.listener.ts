import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class NotificationEventsListener implements OnModuleInit {
  constructor(
    private readonly events: AppEventBus,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit(): void {
    this.events.on<{ userId: string; email: string }>('user.registered', async (event) => {
      await this.notificationService.triggerWelcome(event.userId, event.email);
    });

    this.events.on<{ userId: string; bookingId: string; amount: number; currency: string }>(
      'booking.confirmed',
      async (event) => {
        await this.notificationService.triggerBookingConfirmed(event.userId, {
          templateName: 'booking-confirmed',
          bookingId: event.bookingId,
          amount: event.amount,
          currency: event.currency,
        });
      },
    );

    this.events.on<{ userId: string; points: number; balance: number }>('loyalty.points.earned', async (event) => {
      await this.notificationService.triggerLoyaltyPointsEarned(event.userId, event.points, event.balance);
    });

    this.events.on<{ userId: string; fromTier: string; toTier: string }>('loyalty.tier.upgraded', async (event) => {
      await this.notificationService.triggerTierUpgrade(event.userId, event.fromTier, event.toTier);
    });
  }
}
