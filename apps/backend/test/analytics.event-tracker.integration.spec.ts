import { EventTrackerService } from '../src/modules/analytics/eventTracker.service';
import { AnalyticsRepository } from '../src/modules/analytics/analytics.repository';

describe('Analytics event tracking pipeline', () => {
  it('flushes queued events asynchronously and deduplicates duplicates in same batch', async () => {
    const insertEvents = jest.fn().mockResolvedValue(undefined);
    const repository = { insertEvents } as unknown as AnalyticsRepository;
    const tracker = new EventTrackerService(repository);

    tracker.track({ eventName: 'flight_search', userId: 'u1', metadata: { route: 'DXB-JFK' } });
    tracker.track({ eventName: 'flight_search', userId: 'u1', metadata: { route: 'DXB-JFK' } });
    tracker.track({ eventName: 'booking_created', userId: 'u1', metadata: { bookingId: 'b1' } });

    await tracker.flush();

    expect(insertEvents).toHaveBeenCalledTimes(1);
    const payload = insertEvents.mock.calls[0][0];
    expect(payload).toHaveLength(2);
    expect(payload.some((e: any) => e.eventType === 'BOOK')).toBe(true);
  });

  it('ignores missing optional data and does not throw', async () => {
    const repository = { insertEvents: jest.fn().mockResolvedValue(undefined) } as unknown as AnalyticsRepository;
    const tracker = new EventTrackerService(repository);

    tracker.track({ eventName: 'hotel_search' });
    await expect(tracker.flush()).resolves.toBeUndefined();
  });
});
