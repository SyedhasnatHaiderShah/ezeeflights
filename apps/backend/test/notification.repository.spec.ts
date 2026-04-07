import { NotificationRepository } from '../src/modules/notification/repositories/notification.repository';

describe('NotificationRepository', () => {
  it('maps db calls for list logs', async () => {
    const query = jest.fn().mockResolvedValue([]);
    const repo = new NotificationRepository({ query, queryOne: jest.fn() } as any);
    await repo.listLogs();
    expect(query).toHaveBeenCalled();
  });
});
