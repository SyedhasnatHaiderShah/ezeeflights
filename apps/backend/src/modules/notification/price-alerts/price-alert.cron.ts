import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { PriceAlertService } from './price-alert.service';

@Injectable()
export class PriceAlertCron {
  private readonly logger = new Logger(PriceAlertCron.name);

  constructor(
    private readonly priceAlertService: PriceAlertService,
    private readonly notificationService: NotificationService,
  ) {}

  // Every 15 minutes (cron intent: 0 */15 * * * *)
  async runPriceAlertCheck(): Promise<void> {
    const alerts = await this.priceAlertService.listActive();

    for (const alert of alerts) {
      const currentPrice = this.estimateCurrentPrice(alert.searchParams, alert.targetPrice);
      const crossed = await this.priceAlertService.check(alert, currentPrice);
      if (!crossed) {
        continue;
      }

      await this.notificationService.sendEmail('user@example.com', 'price-drop-alert', {
        userName: 'Traveler',
        route: String(alert.searchParams.route ?? 'Your route'),
        oldPrice: alert.targetPrice,
        newPrice: currentPrice,
        currency: alert.currency,
        searchUrl: '/search',
      });

      await this.notificationService.sendPush(alert.userId, 'Price alert triggered', `New price ${alert.currency} ${currentPrice}`, {
        alertId: alert.id,
        type: alert.type,
      });
    }

    this.logger.log(`Checked ${alerts.length} active price alerts`);
  }

  private estimateCurrentPrice(_searchParams: Record<string, unknown>, targetPrice: number): number {
    const variance = Math.random() * 40 - 20;
    return Math.max(1, Number((targetPrice + variance).toFixed(2)));
  }
}
