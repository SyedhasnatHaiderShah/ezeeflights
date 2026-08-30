import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from '../src/modules/admin/admin.repository';
import { AdminService } from '../src/modules/admin/admin.service';
import { AuditService } from '../src/modules/admin/audit.service';
import { CurrencyService } from '../src/modules/public/currency.service';

describe('AdminService dashboard aggregation', () => {
  it('returns KPI and chart payload with USD-normalized revenue', async () => {
    const createdAt = new Date().toISOString();
    const repo = {
      fetchTripMetricsRows: jest.fn().mockResolvedValue([
        {
          type: 'flight',
          status: 'contacted',
          createdAt,
          total: 100,
          currency: 'USD',
          isManual: true,
        },
        {
          type: 'hotel',
          status: 'pending',
          createdAt,
          total: 27954,
          currency: 'PKR',
          isManual: false,
        },
      ]),
      fetchUsersTrend: jest.fn().mockResolvedValue([]),
      countUsers: jest.fn().mockResolvedValue('1'),
    } as unknown as AdminRepository;

    const currencyService = {
      getRates: jest.fn().mockResolvedValue({ USD: 1, PKR: 279.54 }),
    } as unknown as CurrencyService;

    const service = new AdminService(
      repo,
      {} as JwtService,
      { log: jest.fn() } as unknown as AuditService,
      currencyService,
    );

    const result = await service.getDashboard();

    expect(result.kpi.totalBookings).toBe('2');
    expect(result.kpi.totalUsers).toBe('1');
    expect(result.kpi.totalFlights).toBe('1');
    expect(result.kpi.totalHotels).toBe('1');
    expect(Number(result.kpi.totalRevenue)).toBeCloseTo(200, 0);
    expect(result.charts.usersTrend).toEqual([]);
  });
});
