import { Injectable } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  revenue(range: 'daily' | 'weekly' | 'monthly', from?: string, to?: string) {
    return this.analytics.getRevenue(range, from, to);
  }

  bookings(from?: string, to?: string) {
    return this.analytics.getBookings(from, to);
  }

  funnel(from?: string, to?: string) {
    return this.analytics.getFunnel(from, to);
  }

  userBehavior(from?: string, to?: string) {
    return this.analytics.getUserBehavior(from, to);
  }
}
