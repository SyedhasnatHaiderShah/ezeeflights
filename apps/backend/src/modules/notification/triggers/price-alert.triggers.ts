import { Injectable } from '@nestjs/common';
import { PriceAlertCron } from '../price-alerts/price-alert.cron';

@Injectable()
export class PriceAlertTriggers {
  constructor(private readonly priceAlertCron: PriceAlertCron) {}

  async runScheduledCheck(): Promise<void> {
    await this.priceAlertCron.runPriceAlertCheck();
  }
}
