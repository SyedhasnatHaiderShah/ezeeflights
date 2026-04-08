import { AdminOpsRepository } from '../src/modules/admin-ops/admin-ops.repository';
import { RevenueService } from '../src/modules/admin-ops/revenue.service';

describe('RevenueService aggregation', () => {
  it('returns overview and module metrics', async () => {
    const repo = {
      revenueOverview: jest.fn().mockResolvedValue({ dailyRevenue: 100, monthlyRevenue: 1000, yearlyRevenue: 12000, averageOrderValue: 250, revenuePerUser: 80, paymentSuccessRate: 99, refundRatio: 2 }),
      revenueByModule: jest.fn().mockResolvedValue([{ module: 'Flights', revenue: 600, bookings: 4 }]),
    } as unknown as AdminOpsRepository;

    const service = new RevenueService(repo);
    await expect(service.getOverview('2026-01-01', '2026-01-31')).resolves.toEqual({
      dailyRevenue: 100,
      monthlyRevenue: 1000,
      yearlyRevenue: 12000,
      averageOrderValue: 250,
      revenuePerUser: 80,
      paymentSuccessRate: 99,
      refundRatio: 2,
      byModule: [{ module: 'Flights', revenue: 600, bookings: 4 }],
    });
  });
});
