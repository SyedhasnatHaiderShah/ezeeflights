import { AuthRepository } from '../src/modules/auth/repositories/auth.repository';
import { PostgresClient } from '../src/database/postgres.client';

describe('AuthRepository', () => {
  it('maps role slugs from join query result', async () => {
    const db = {
      query: jest.fn().mockResolvedValue([{ slug: 'customer' }, { slug: 'admin' }]),
      queryOne: jest.fn(),
      withTransaction: jest.fn(),
    } as unknown as PostgresClient;

    const repo = new AuthRepository(db);
    const roles = await repo.getRoleSlugsForUser('user-id');

    expect(roles).toEqual(['customer', 'admin']);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('user_roles'), ['user-id']);
  });
});
