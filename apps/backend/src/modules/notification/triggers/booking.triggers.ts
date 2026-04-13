import { Injectable } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class BookingTriggers {
  constructor(private readonly notificationService: NotificationService) {}

  async onBookingCreated(to: string, variables: Record<string, unknown>): Promise<void> {
    await this.notificationService.sendEmail(to, 'booking-confirmation', variables);
  }

  async onCheckInReminder(to: string, variables: Record<string, unknown>): Promise<void> {
    await this.notificationService.sendEmail(to, 'check-in-reminder', variables);
  }
}
