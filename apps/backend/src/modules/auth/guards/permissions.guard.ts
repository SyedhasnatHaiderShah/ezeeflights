import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRepository } from '../repositories/auth.repository';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequestUser {
  userId: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authRepository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }
    const req = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const userId = req.user?.userId;
    if (!userId) {
      return false;
    }
    const permissions = await this.authRepository.getPermissionSlugsForUser(userId);
    return required.every((p) => permissions.includes(p));
  }
}
