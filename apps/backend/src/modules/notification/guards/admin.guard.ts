import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: { email?: string; roles?: string[] } }>();
    const user = request.user;
    const allowedEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const hasRole = Boolean(user?.roles?.includes('admin'));
    const hasEmail = Boolean(user?.email && allowedEmails.includes(user.email));

    if (!hasRole && !hasEmail) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
