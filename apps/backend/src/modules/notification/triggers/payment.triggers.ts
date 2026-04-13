import { Injectable } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class PaymentTriggers {
  constructor(private readonly notificationService: NotificationService) {}

  async onPaymentProcessed(to: string, variables: Record<string, unknown>): Promise<void> {
    await this.notificationService.sendEmail(to, 'payment-success', variables);
  }
}
