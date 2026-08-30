import { Injectable } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class FlightTriggers {
  constructor(private readonly notificationService: NotificationService) {}

  async onFlightDelayed(email: string, phone: string | null, variables: Record<string, unknown>): Promise<void> {
    await this.notificationService.sendEmail(email, 'flight-delay-alert', variables);
    if (phone) {
      await this.notificationService.sendSms(phone, 'flight-delay-alert', variables);
    }
  }
}
