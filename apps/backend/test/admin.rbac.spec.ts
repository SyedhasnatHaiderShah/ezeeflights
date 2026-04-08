import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRepository } from '../src/modules/admin/admin.repository';
import { AdminPermissionAction } from '../src/modules/admin/dto/admin.dto';
import { AdminRbacGuard } from '../src/modules/admin/rbac.middleware';

describe('AdminRbacGuard', () => {
  it('allows access when permission exists', async () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue({ module: 'USERS', action: AdminPermissionAction.READ }) } as unknown as Reflector;
    const repo = { hasModulePermission: jest.fn().mockResolvedValue(true) } as unknown as AdminRepository;
    const guard = new AdminRbacGuard(reflector, repo);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({ user: { userId: 'u1' } }) }),
      getHandler: () => null,
      getClass: () => null,
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
