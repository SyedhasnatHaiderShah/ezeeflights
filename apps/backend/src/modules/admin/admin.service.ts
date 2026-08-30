import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import { AdminRepository } from "./admin.repository";
import {
  AssignRoleDto,
  CreateRoleDto,
  UpdateBookingDto,
  UpdateRoleDto,
  UpdateSettingsDto,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from "./dto/admin.dto";
import { AuditService } from "./audit.service";
import { CurrencyService } from "../public/currency.service";
import { MysqlClient } from "../../database/mysql.client";

@Injectable()
export class AdminService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
    private readonly currencyService: CurrencyService,
    private readonly mysql: MysqlClient,
  ) {}

  async login(email: string, password: string, req: Request) {
    const user = await this.repo.findUserWithPasswordByEmail(email);
    if (
      !user?.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const admin = await this.repo.getAdminByUserId(user.id);
    if (!admin) {
      throw new UnauthorizedException("Not an admin account");
    }
    await this.repo.createAdminSession(admin.id, req.ip ?? null);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      adminRole: admin.roleName,
    });

    await this.audit.log(user.id, "AUTH", "LOGIN", {
      ipAddress: req.ip ?? null,
    });
    return { accessToken: token, tokenType: "Bearer", role: admin.roleName };
  }

  async me(userId: string) {
    return this.repo.getAdminByUserId(userId);
  }

  async getRoles() {
    const roles = await this.repo.listRoles();
    return Promise.all(
      roles.map(async (role) => ({
        ...role,
        permissions: await this.repo.listRolePermissions(role.id),
      })),
    );
  }

  async createRole(dto: CreateRoleDto, actorId: string) {
    const role = await this.repo.createRole(dto.name);
    if (!role) throw new UnauthorizedException("Unable to create role");
    await this.repo.setRolePermissions(role.id, dto.permissions);
    await this.audit.log(actorId, "RBAC", "CREATE_ROLE", { roleId: role.id });
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto, actorId: string) {
    if (dto.name) await this.repo.updateRoleName(id, dto.name);
    if (dto.permissions)
      await this.repo.setRolePermissions(id, dto.permissions);
    await this.audit.log(actorId, "RBAC", "UPDATE_ROLE", { roleId: id });
    return { id, updated: true };
  }

  private toUsd(
    amount: number,
    currency: string,
    rates: Record<string, number>,
  ): number {
    const code = (currency || "USD").toUpperCase();
    if (code === "USD") {
      return amount;
    }
    const rate = rates[code];
    if (!rate) {
      return amount;
    }
    return amount / rate;
  }

  private mapTrend(
    entries: Map<string, number>,
    asInteger = false,
  ): { date: string; value: string }[] {
    return [...entries.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        value: asInteger
          ? String(Math.round(value))
          : value.toFixed(2),
      }));
  }

  async getDashboard() {
    const [rows, usersTrend, totalUsers] = await Promise.all([
      this.repo.fetchTripMetricsRows(),
      this.repo.fetchUsersTrend(),
      this.repo.countUsers(),
    ]);

    const rates = await this.currencyService.getRates();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    let totalRevenueUsd = 0;
    let totalFlights = 0;
    let totalHotels = 0;
    let totalCars = 0;
    let finalizedCount = 0;
    const revenueByDate = new Map<string, number>();
    const bookingsByDate = new Map<string, number>();
    const cancellationsByDate = new Map<string, number>();

    for (const row of rows) {
      const usdTotal = this.toUsd(Number(row.total) || 0, row.currency, rates);
      totalRevenueUsd += usdTotal;

      if (row.type === "flight") totalFlights++;
      if (row.type === "hotel") totalHotels++;
      if (row.type === "car") totalCars++;

      const isPendingInquiry =
        row.isManual && ["pending", "reviewed"].includes(row.status);
      if (!isPendingInquiry) finalizedCount++;

      const createdAt = new Date(row.createdAt);
      if (createdAt >= cutoff) {
        const dateKey = createdAt.toISOString().slice(0, 10);
        bookingsByDate.set(
          dateKey,
          (bookingsByDate.get(dateKey) ?? 0) + 1,
        );
        revenueByDate.set(
          dateKey,
          (revenueByDate.get(dateKey) ?? 0) + usdTotal,
        );
        if (["cancelled", "closed", "rejected"].includes(row.status)) {
          cancellationsByDate.set(
            dateKey,
            (cancellationsByDate.get(dateKey) ?? 0) + 1,
          );
        }
      }
    }

    const totalBookings = rows.length;
    const conversionRate =
      totalBookings === 0
        ? "0"
        : ((finalizedCount / totalBookings) * 100).toFixed(2);

    return {
      kpi: {
        totalRevenue: totalRevenueUsd.toFixed(2),
        totalBookings: String(totalBookings),
        totalUsers,
        totalFlights: String(totalFlights),
        totalHotels: String(totalHotels),
        totalCars: String(totalCars),
        conversionRate,
      },
      charts: {
        bookingsTrend: this.mapTrend(bookingsByDate, true),
        revenueTrend: this.mapTrend(revenueByDate),
        usersTrend,
        cancellations: this.mapTrend(cancellationsByDate, true),
      },
    };
  }
  getUsers(limit: number = 10, page: number = 1, search?: string) {
    return this.repo.listAllUsers(limit, page, search);
  }

  async createUser(dto: CreateAdminUserDto, actorId: string) {
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;
    const user = await this.repo.createUser({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      role: dto.role,
      phone: dto.phone,
    });
    if (!user) {
      throw new Error("Unable to create user");
    }
    await this.repo.syncUserRbacRoleByLegacyRole(user.id, dto.role);
    await this.audit.log(actorId, "USERS", "CREATE_USER", { userId: user.id });
    return user;
  }

  async updateUser(id: string, dto: UpdateAdminUserDto, actorId: string) {
    const user = await this.repo.updateUser(id, {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      phone: dto.phone,
    });
    if (dto.role) {
      await this.repo.syncUserRbacRoleByLegacyRole(id, dto.role);
    }
    await this.audit.log(actorId, "USERS", "UPDATE_USER", { userId: id });
    return user;
  }

  async deleteUser(id: string, actorId: string) {
    const res = await this.repo.deleteUser(id);
    await this.audit.log(actorId, "USERS", "DELETE_USER", { userId: id });
    return res;
  }

  async assignRole(userId: string, dto: AssignRoleDto, actorId: string) {
    await this.repo.assignAdminRole(userId, dto.roleId);
    await this.audit.log(actorId, "USERS", "ASSIGN_ROLE", {
      userId,
      roleId: dto.roleId,
    });
    return { success: true };
  }

  getBookings(limit?: number, page?: number, tab?: string) {
    return this.repo.getBookings(limit, page, tab);
  }
  async updateBooking(id: string, dto: UpdateBookingDto, actorId: string) {
    const updated = await this.repo.updateBooking(
      id,
      dto.status ?? "CONFIRMED",
    );
    try {
      await this.audit.log(actorId, "BOOKINGS", "UPDATE_BOOKING", {
        bookingId: id,
        status: dto.status,
      });
    } catch (err) {
      console.error("Failed to log audit event:", err);
      // Don't crash the whole request if logging fails
    }
    return updated;
  }
  getPayments() {
    return this.repo.getPayments();
  }
  getRefunds() {
    return this.repo.getRefunds();
  }
  getAnalytics() {
    return this.repo.getAnalytics();
  }
  getSettings() {
    return this.repo.getSettings();
  }

  async updateSettings(dto: UpdateSettingsDto, actorId: string) {
    const row = await this.repo.upsertSetting(dto.key, dto.value);
    await this.audit.log(actorId, "SETTINGS", "UPDATE_SETTING", {
      key: dto.key,
    });
    return row;
  }

  getAuditLogs() {
    return this.repo.getAuditLogs();
  }
  async getCrmUsers(limit: number = 10) {
    return this.mysql.query(
      `SELECT * FROM tbl_users ORDER BY id DESC LIMIT ?`,
      [limit],
    );
  }

  async getCrmBookings(limit: number = 10) {
    return this.mysql.query(
      `SELECT cd.*, 
        (SELECT GROUP_CONCAT(fullName SEPARATOR ', ') 
         FROM tbl_customer 
         WHERE customerId = cd.customerId) AS travelers 
       FROM tbl_customerdetails cd 
       ORDER BY cd.customerId DESC 
       LIMIT ?`,
      [limit],
    );
  }

  getAlerts() {
    return this.repo.getAlerts();
  }
}
