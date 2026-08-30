import { FinanceService } from '../src/modules/admin-ops/finance.service';
import { InsightsService } from '../src/modules/admin-ops/insights.service';
import { MonitoringService } from '../src/modules/admin-ops/monitoring.service';
import { OperationsService } from '../src/modules/admin-ops/operations.service';
import { RevenueService } from '../src/modules/admin-ops/revenue.service';

describe('Admin Ops dependency surface', () => {
  it('keeps cross-module integration methods exposed', () => {
    const methods = [
      [RevenueService, 'getOverview'],
      [OperationsService, 'getStatus'],
      [FinanceService, 'getSettlements'],
      [MonitoringService, 'getLiveSnapshot'],
      [InsightsService, 'trends'],
    ] as const;

    for (const [klass, method] of methods) {
      expect(typeof (klass as any).prototype[method]).toBe('function');
    }
  });
});
