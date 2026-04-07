import { Test } from '@nestjs/testing';
import { AppEventBus } from '../src/common/events/app-event-bus.service';
import { PostgresClient } from '../src/database/postgres.client';
import { AnalyticsRepository } from '../src/modules/analytics/analytics.repository';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { EventTrackerService } from '../src/modules/analytics/eventTracker.service';

describe('Analytics dependency tests', () => {
  it('registers listeners for booking/payment module events', async () => {
    const on = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: AnalyticsRepository, useValue: { insertBookingSnapshot: jest.fn(), rebuildDailyAggregates: jest.fn() } },
        { provide: EventTrackerService, useValue: { track: jest.fn() } },
        { provide: PostgresClient, useValue: { query: jest.fn() } },
        { provide: AppEventBus, useValue: { on } },
      ],
    }).compile();

    moduleRef.get(AnalyticsService).onModuleInit();

    expect(on).toHaveBeenCalledWith('booking.created', expect.any(Function));
    expect(on).toHaveBeenCalledWith('payment.success', expect.any(Function));
  });
});
