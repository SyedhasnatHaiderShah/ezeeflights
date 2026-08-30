import { AdminOpsRepository } from '../src/modules/admin-ops/admin-ops.repository';
import { OperationsService } from '../src/modules/admin-ops/operations.service';

describe('OperationsService SLA calculations', () => {
  it('returns delayed booking entries and status payload', async () => {
    const repo = {
      operationsStatus: jest.fn().mockResolvedValue({ activeBookings: 10, pendingBookings: 3, failedBookings: 1, cancellationRate: 4.2, slaBreaches: 2, avgProcessingTimeSec: 85 }),
      operationsSla: jest.fn().mockResolvedValue([{ bookingId: 'b1', status: 'DELAYED', delayMinutes: 6 }]),
    } as unknown as AdminOpsRepository;

    const service = new OperationsService(repo);
    await expect(service.getStatus()).resolves.toMatchObject({ slaBreaches: 2 });
    await expect(service.getSla()).resolves.toEqual([{ bookingId: 'b1', status: 'DELAYED', delayMinutes: 6 }]);
  });
});
