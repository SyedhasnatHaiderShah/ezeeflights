import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { AdminRepository } from './admin.repository';
import { AssignRoleDto, CreateRoleDto, UpdateBookingDto, UpdateRoleDto, UpdateSettingsDto } from './dto/admin.dto';
import { AuditService } from './audit.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string, req: Request) {
    const user = await this.repo.findUserWithPasswordByEmail(email);
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const admin = await this.repo.getAdminByUserId(user.id);
    if (!admin) {
      throw new UnauthorizedException('Not an admin account');
    }
    await this.repo.createAdminSession(admin.id, req.ip ?? null);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      adminRole: admin.roleName,
    });

    await this.audit.log(user.id, 'AUTH', 'LOGIN', { ipAddress: req.ip ?? null });
    return { accessToken: token, tokenType: 'Bearer', role: admin.roleName };
  }

  async me(userId: string) {
    return this.repo.getAdminByUserId(userId);
  }

  async getRoles() {
    const roles = await this.repo.listRoles();
    return Promise.all(roles.map(async (role) => ({ ...role, permissions: await this.repo.listRolePermissions(role.id) })));
  }

  async createRole(dto: CreateRoleDto, actorId: string) {
    const role = await this.repo.createRole(dto.name);
    if (!role) throw new UnauthorizedException('Unable to create role');
    await this.repo.setRolePermissions(role.id, dto.permissions);
    await this.audit.log(actorId, 'RBAC', 'CREATE_ROLE', { roleId: role.id });
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto, actorId: string) {
    if (dto.name) await this.repo.updateRoleName(id, dto.name);
    if (dto.permissions) await this.repo.setRolePermissions(id, dto.permissions);
    await this.audit.log(actorId, 'RBAC', 'UPDATE_ROLE', { roleId: id });
    return { id, updated: true };
  }

  getDashboard() { return Promise.all([this.repo.dashboardSummary(), this.repo.chartSeries()]).then(([kpi, charts]) => ({ kpi, charts })); }
  getUsers() { return this.repo.listAdminUsers(); }

  async assignRole(userId: string, dto: AssignRoleDto, actorId: string) {
    await this.repo.assignAdminRole(userId, dto.roleId);
    await this.audit.log(actorId, 'USERS', 'ASSIGN_ROLE', { userId, roleId: dto.roleId });
    return { success: true };
  }

  getBookings() { return this.repo.getBookings(); }
  async updateBooking(id: string, dto: UpdateBookingDto, actorId: string) {
    const updated = await this.repo.updateBooking(id, dto.status ?? 'CONFIRMED');
    await this.audit.log(actorId, 'BOOKINGS', 'UPDATE_BOOKING', { bookingId: id, status: dto.status });
    return updated;
  }
  getPayments() { return this.repo.getPayments(); }
  getRefunds() { return this.repo.getRefunds(); }
  getAnalytics() { return this.repo.getAnalytics(); }
  getSettings() { return this.repo.getSettings(); }

  async updateSettings(dto: UpdateSettingsDto, actorId: string) {
    const row = await this.repo.upsertSetting(dto.key, dto.value);
    await this.audit.log(actorId, 'SETTINGS', 'UPDATE_SETTING', { key: dto.key });
    return row;
  }

  getAuditLogs() { return this.repo.getAuditLogs(); }
  getAlerts() { return this.repo.getAlerts(); }
}
