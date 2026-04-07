import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { AnalyticsRepository } from '../src/modules/analytics/analytics.repository';

describe('AnalyticsService', () => {
  const repository = {
    getRevenue: jest.fn(),
    getBookingMetrics: jest.fn(),
    getFunnel: jest.fn(),
    getUserBehavior: jest.fn(),
    rebuildDailyAggregates: jest.fn(),
    insertBookingSnapshot: jest.fn(),
  } as unknown as jest.Mocked<AnalyticsRepository>;

  const tracker = { track: jest.fn() } as any;
  const db = { query: jest.fn() } as any;
  const events = { on: jest.fn() } as any;

  const service = new AnalyticsService(repository, tracker, db, events);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns revenue payload and keeps requested range', async () => {
    repository.getRevenue.mockResolvedValue([
      { periodStart: new Date('2026-01-01T00:00:00Z'), totalRevenue: 1200, totalBookings: 3, avgBookingValue: 400 },
    ]);

    const result = await service.getRevenue('monthly', '2026-01-01', '2026-01-31');

    expect(result.range).toBe('monthly');
    expect(result.data[0].avgBookingValue).toBe(400);
  });

  it('returns safe defaults when booking metrics are missing', async () => {
    repository.getBookingMetrics.mockResolvedValue(null as any);
    await expect(service.getBookings()).resolves.toEqual({ totalBookings: 0, cancellations: 0, successfulBookings: 0, successRate: 0 });
  });
});
