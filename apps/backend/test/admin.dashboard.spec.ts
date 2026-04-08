import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from '../src/modules/admin/admin.repository';
import { AdminService } from '../src/modules/admin/admin.service';
import { AuditService } from '../src/modules/admin/audit.service';

describe('AdminService dashboard aggregation', () => {
  it('returns KPI and chart payload', async () => {
    const repo = {
      dashboardSummary: jest.fn().mockResolvedValue({ totalRevenue: '100', totalBookings: '2', activeUsers: '1', conversionRate: '50' }),
      chartSeries: jest.fn().mockResolvedValue({ bookingsTrend: [], revenueTrend: [], cancellations: [] }),
    } as unknown as AdminRepository;

    const service = new AdminService(repo, {} as JwtService, { log: jest.fn() } as unknown as AuditService);
    await expect(service.getDashboard()).resolves.toEqual({
      kpi: { totalRevenue: '100', totalBookings: '2', activeUsers: '1', conversionRate: '50' },
      charts: { bookingsTrend: [], revenueTrend: [], cancellations: [] },
    });
  });
});
