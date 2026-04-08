import { AdminService } from '../src/modules/admin/admin.service';

describe('Admin dependency integration surface', () => {
  it('exposes control center methods for dependent modules', () => {
    const methods = [
      'getBookings',
      'getPayments',
      'getRefunds',
      'getAnalytics',
      'getSettings',
      'updateSettings',
      'getUsers',
    ];
    for (const method of methods) {
      expect(typeof (AdminService as any).prototype[method]).toBe('function');
    }
  });
});
