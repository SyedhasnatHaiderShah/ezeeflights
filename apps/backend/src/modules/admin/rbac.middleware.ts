import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRepository } from './admin.repository';
import { AdminPermissionAction } from './dto/admin.dto';

export const ADMIN_PERMISSION_KEY = 'admin_permission';

export const AdminPermission = (module: string, action: AdminPermissionAction) =>
  SetMetadata(ADMIN_PERMISSION_KEY, { module, action });

interface AdminRequest {
  user?: { userId?: string };
}

@Injectable()
export class AdminRbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly repo: AdminRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{ module: string; action: AdminPermissionAction }>(ADMIN_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) {
      return true;
    }

    const req = context.switchToHttp().getRequest<AdminRequest>();
    const userId = req.user?.userId;
    if (!userId) {
      throw new UnauthorizedException('Missing admin session');
    }

    const allowed = await this.repo.hasModulePermission(userId, required.module, required.action);
    if (!allowed) {
      throw new ForbiddenException(`Missing ${required.action} permission for ${required.module}`);
    }

    return true;
  }
}
