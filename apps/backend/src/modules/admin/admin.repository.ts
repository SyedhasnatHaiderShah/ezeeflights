import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, In } from "typeorm";
import { randomUUID } from "crypto";
import { User } from "../user/entities/user.entity";
import {
  AdminPermissionAction,
  CreateRolePermissionDto,
} from "./dto/admin.dto";

@Injectable()
export class AdminRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private mapLegacyRoleToSlug(role?: string): string {
    const normalized = (role ?? "").trim().toUpperCase();
    if (normalized === "ADMIN") return "admin";
    if (normalized === "SUB-ADMIN") return "sub-admin";
    if (normalized === "SUPPORT") return "support";
    return "customer";
  }

  private async getDefaultCurrencyFields() {
    try {
      const rows = await this.dataSource.query<{ table_name: string }[]>(
        `SELECT table_name FROM information_schema.columns
         WHERE table_schema = 'public'
           AND column_name = 'default_currency'
           AND table_name IN ('bookings', 'hotel_bookings', 'car_bookings', 'transfer_bookings', 'package_bookings')`
      );
      const colList = Array.isArray(rows) ? rows : (rows as any)?.rows || [];
      const tables = new Set(colList.map((r: any) => r.table_name));
      return {
        bookings: tables.has('bookings') ? 'b.default_currency' : 'b.currency',
        hotel_bookings: tables.has('hotel_bookings') ? 'hb.default_currency' : 'hb.currency',
        car_bookings: tables.has('car_bookings') ? 'cb.default_currency' : 'cb.currency',
        transfer_bookings: tables.has('transfer_bookings') ? 'tb.default_currency' : 'tb.currency',
        package_bookings: tables.has('package_bookings') ? 'pb.default_currency' : 'pb.currency',
      };
    } catch {
      return {
        bookings: 'b.currency',
        hotel_bookings: 'hb.currency',
        car_bookings: 'cb.currency',
        transfer_bookings: 'tb.currency',
        package_bookings: 'pb.currency',
      };
    }
  }

  
  private async queryOne<T>(query: string, params?: any[]): Promise<T | null> {
    const res = await this.dataSource.query(query, params);
    return res && res.length > 0 ? res[0] : null;
  }

  async getAdminByUserId(userId: string) {
    const user = await this.queryOne<{ id: string; role: string }>(
      `SELECT id, role FROM tbl_users WHERE id = ?`,
      [userId],
    );
    if (!user) return null;
    return {
      id: user.id,
      userId: user.id,
      roleId: user.role,
      roleName: user.role,
    };
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const row = await this.queryOne<{ isAdmin: boolean | number }>(
      `SELECT EXISTS(SELECT 1 FROM tbl_users WHERE id = ? AND role IN ('ADMIN', 'SUB-ADMIN')) as "isAdmin"`,
      [userId],
    );
    return !!row?.isAdmin;
  }

  findUserWithPasswordByEmail(email: string) {
    return this.queryOne<{
      id: string;
      email: string;
      passwordHash: string | null;
    }>(
      `SELECT id, email, password_hash as "passwordHash" FROM tbl_users WHERE lower(email) = lower(?) LIMIT 1`,
      [email],
    );
  }

  async hasModulePermission(
    userId: string,
    module: string,
    action: AdminPermissionAction,
  ): Promise<boolean> {
    const isAdmin = await this.isUserAdmin(userId);
    return isAdmin;
  }

  async listRoles() {
    return [
      { id: 'ADMIN', name: 'ADMIN' },
      { id: 'SUB-ADMIN', name: 'SUB-ADMIN' },
      { id: 'SUPPORT', name: 'SUPPORT' }
    ];
  }

  async listRolePermissions(roleId: string) {
    return [];
  }

  async createRole(name: string) {
    return { id: name.toUpperCase(), name };
  }

  async setRolePermissions(
    roleId: string,
    permissions: CreateRolePermissionDto[],
  ) {
    // No-op
  }

  async updateRoleName(roleId: string, name: string) {
    return { id: roleId, name };
  }

  listAdminUsers() {
    return this.dataSource.query<{
      id: string;
      email: string;
      roleId: string;
      roleName: string;
    }[]>(
      `SELECT id, email, role as "roleId", role as "roleName"
       FROM tbl_users
       WHERE role IN ('ADMIN', 'SUB-ADMIN', 'SUPPORT')
       ORDER BY email`,
    );
  }

  listAllUsers(limit: number = 10, page: number = 1, search?: string) {
    const offset = (page - 1) * limit;
    let whereClause = "";
    const params: any[] = [];

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      whereClause = `WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR CONCAT(first_name, ' ', last_name) LIKE ?`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    params.push(limit, offset);

    return this.dataSource.query<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      phone: string;
      createdAt: string;
    }[]>(
      `SELECT id, email, first_name as "firstName", last_name as "lastName", role, phone, created_at as "createdAt"
       FROM tbl_users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      params,
    );
  }

  async assignAdminRole(userId: string, roleId: string) {
    await this.userRepo.update(userId, { role: roleId as any });
  }

  async syncUserRbacRoleByLegacyRole(userId: string, role?: string) {
    const roleSlug = this.mapLegacyRoleToSlug(role);
    let targetRole = 'USER';
    if (roleSlug === 'admin') targetRole = 'ADMIN';
    else if (roleSlug === 'sub-admin') targetRole = 'SUB-ADMIN';
    else if (roleSlug === 'support') targetRole = 'SUPPORT';
    await this.userRepo.update(userId, { role: targetRole as any });
  }

  async createUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    passwordHash?: string;
    role?: string;
    phone?: string;
  }) {
    const user = this.userRepo.create({
      id: randomUUID(),
      email: data.email,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      passwordHash: data.passwordHash || null,
      role: data.role as any || "USER",
      phone: data.phone || null,
    });
    const saved = await this.userRepo.save(user);
    return {
      id: saved.id,
      email: saved.email,
      firstName: saved.firstName,
      lastName: saved.lastName,
      role: saved.role,
      phone: saved.phone
    };
  }

  async updateUser(
    id: string,
    data: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      phone: string;
    }>,
  ) {
    if (Object.keys(data).length === 0) return this.findUserById(id);
    await this.userRepo.update(id, data as any);
    return this.findUserById(id);
  }

  async deleteUser(id: string) {
    await this.userRepo.delete(id);
    return { id, deleted: true };
  }

  async findUserById(id: string) {
    return this.queryOne<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      phone: string;
    }>(
      `SELECT id, email, first_name as "firstName", last_name as "lastName", role, phone FROM tbl_users WHERE id = ?`,
      [id],
    );
  }

  /** Unified trip rows for dashboard KPIs/charts — mirrors getBookings() sources. */
  private readonly allTripsMetricsCte = `
    all_trips AS (
      SELECT
        'flight' AS type,
        LOWER(b.status) AS status,
        b.created_at,
        COALESCE(b.total_amount, 0) AS total,
        COALESCE(NULLIF(b.currency, ''), 'USD') AS currency,
        false AS is_manual
      FROM bookings b

      UNION ALL

      SELECT
        'hotel',
        LOWER(hb.status),
        hb.created_at,
        COALESCE(hb.total_price, 0),
        COALESCE(NULLIF(hb.currency, ''), 'USD'),
        false
      FROM hotel_bookings hb

      UNION ALL

      SELECT
        'car',
        LOWER(cb.status),
        cb.created_at,
        COALESCE(cb.total_price, 0),
        COALESCE(NULLIF(cb.currency, ''), 'USD'),
        false
      FROM car_bookings cb

      UNION ALL

      SELECT
        'transfer',
        LOWER(tb.status),
        tb.created_at,
        COALESCE(tb.price, 0),
        COALESCE(NULLIF(tb.currency, ''), 'USD'),
        false
      FROM transfer_bookings tb

      UNION ALL

      SELECT
        'package',
        LOWER(pb.booking_status),
        pb.created_at,
        COALESCE(pb.total_amount, 0),
        COALESCE(NULLIF(pb.currency, ''), 'USD'),
        false
      FROM package_bookings pb

      UNION ALL

      SELECT
        'flight',
        LOWER(inq.status),
        inq.created_at,
        COALESCE(
          NULLIF(JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.totalCost')), ''),
          NULLIF(JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.totalFare')), ''),
          0
        ),
        COALESCE(
          NULLIF(JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.currency')), ''),
          'USD'
        ),
        true
      FROM flight_inquiries inq
    )`;

  fetchTripMetricsRows() {
    return this.dataSource.query<{
      type: string;
      status: string;
      createdAt: string;
      total: number;
      currency: string;
      isManual: boolean;
    }[]>(
      `WITH ${this.allTripsMetricsCte}
       SELECT
         type,
         status,
         created_at as "createdAt",
         total,
         currency,
         is_manual as "isManual"
       FROM all_trips`,
    );
  }

  countUsers() {
    return this.queryOne<{ count: string }>(
        `SELECT count(*) as count FROM tbl_users`,
      )
      .then((row) => row?.count ?? "0");
  }

  fetchUsersTrend() {
    return this.dataSource.query<{ date: string; value: string }[]>(
      `SELECT DATE_FORMAT(DATE(created_at), '%Y-%m-%d') as date, count(*) as value
       FROM tbl_users
       WHERE created_at >= NOW() - INTERVAL 30 DAY
       GROUP BY 1
       ORDER BY 1`,
    );
  }

  async getBookings(limit: number = 10, page: number = 1, tab?: string) {
    const offset = (page - 1) * limit;
    let whereClause = "";
    if (tab === "pending") {
      whereClause = 'WHERE "isManual" = true AND status IN (\'pending\', \'reviewed\')';
    } else if (tab === "finalized") {
      whereClause = 'WHERE NOT ("isManual" = true AND status IN (\'pending\', \'reviewed\'))';
    }

    const fields = await this.getDefaultCurrencyFields();

    return this.dataSource.query(
      `SELECT * FROM (
         SELECT b.id,
           'flight' as type,
           LOWER(b.status) as status,
           CONCAT('FLT-', UPPER(LEFT(REPLACE(b.id, '-', ''), 8))) as \"confirmationCode\",
           b.currency,
           ${fields.bookings} as \"defaultCurrency\",
           b.total_amount as total,
           b.created_at as \"startDate\",
           b.created_at as \"endDate\",
           'Flight Booking' as title,
           pr.pnr_code as subtitle,
           b.created_at as \"createdAt\",
           b.user_id as \"userId\",
           u.email as \"userEmail\",
           false as \"isManual\"
         FROM bookings b
         LEFT JOIN tbl_users u ON u.id = b.user_id
         LEFT JOIN pnr_records pr ON pr.booking_id = b.id

         UNION ALL

         SELECT hb.id,
           'hotel' as type,
           LOWER(hb.status) as status,
           CONCAT('HTL-', UPPER(LEFT(REPLACE(hb.id, '-', ''), 8))) as \"confirmationCode\",
           hb.currency,
           ${fields.hotel_bookings} as \"defaultCurrency\",
           hb.total_price as total,
           hb.check_in_date as \"startDate\",
           hb.check_out_date as \"endDate\",
           'Hotel Booking' as title,
           '' as subtitle,
           hb.created_at as \"createdAt\",
           hb.user_id as \"userId\",
           u.email as \"userEmail\",
           false as \"isManual\"
         FROM hotel_bookings hb
         LEFT JOIN tbl_users u ON u.id = hb.user_id

         UNION ALL

         SELECT cb.id,
           'car' as type,
           LOWER(cb.status) as status,
           CONCAT('CAR-', UPPER(LEFT(REPLACE(cb.id, '-', ''), 8))) as \"confirmationCode\",
           cb.currency,
           ${fields.car_bookings} as \"defaultCurrency\",
           cb.total_price as total,
           cb.pickup_datetime as \"startDate\",
           cb.dropoff_datetime as \"endDate\",
           CONCAT(c.make, ' ', c.model) as title,
           cl.name as subtitle,
           cb.created_at as \"createdAt\",
           cb.user_id as \"userId\",
           u.email as \"userEmail\",
           false as \"isManual\"
         FROM car_bookings cb
         JOIN cars c ON c.id = cb.car_id
         LEFT JOIN car_locations cl ON cl.id = cb.pickup_location_id
         LEFT JOIN tbl_users u ON u.id = cb.user_id

         UNION ALL

         SELECT tb.id,
           'transfer' as type,
           LOWER(tb.status) as status,
           CONCAT('TRF-', UPPER(LEFT(REPLACE(tb.id, '-', ''), 8))) as \"confirmationCode\",
           tb.currency,
           ${fields.transfer_bookings} as \"defaultCurrency\",
           tb.price as total,
           tb.pickup_datetime as \"startDate\",
           tb.pickup_datetime as \"endDate\",
           CONCAT(v.vehicle_type, ' (', v.transfer_type, ')') as title,
           tb.pickup_address as subtitle,
           tb.created_at as \"createdAt\",
           tb.user_id as \"userId\",
           u.email as \"userEmail\",
           false as \"isManual\"
         FROM transfer_bookings tb
         JOIN transfer_vehicles v ON v.id = tb.vehicle_id
         LEFT JOIN tbl_users u ON u.id = tb.user_id

         UNION ALL

         SELECT pb.id,
           'package' as type,
           LOWER(pb.booking_status) as status,
           CONCAT('PKG-', UPPER(LEFT(REPLACE(pb.id, '-', ''), 8))) as \"confirmationCode\",
           pb.currency,
           ${fields.package_bookings} as \"defaultCurrency\",
           pb.total_amount as total,
           pb.created_at as \"startDate\",
           pb.created_at as \"endDate\",
           p.title,
           CONCAT(p.destination, ', ', p.country) as subtitle,
           pb.created_at as \"createdAt\",
           pb.user_id as \"userId\",
           u.email as \"userEmail\",
           false as \"isManual\"
         FROM package_bookings pb
         JOIN packages p ON p.id = pb.package_id
         LEFT JOIN tbl_users u ON u.id = pb.user_id

         UNION ALL

         SELECT inq.id,
           'flight' as type,
           LOWER(inq.status) as status,
           CONCAT('INQ-', UPPER(LEFT(REPLACE(inq.id, '-', ''), 8))) as \"confirmationCode\",
           COALESCE(JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.currency')), 'USD') as currency,
           COALESCE(
             JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.defaultCurrency')),
             JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.currency')),
             'USD'
           ) as \"defaultCurrency\",
           COALESCE((JSON_UNQUOTE(JSON_EXTRACT(inq.flight_snapshot, '$.totalCost'))), 0) as total,
           COALESCE(inq.depart_date, inq.created_at) as \"startDate\",
           COALESCE(inq.depart_date, inq.created_at) as \"endDate\",
           CONCAT(inq.origin, ' → ', inq.destination) as title,
           CONCAT(COALESCE(inq.depart_date, 'No Date'), ' • ', COALESCE(inq.cabin_class, 'Economy')) as subtitle,
           inq.created_at as \"createdAt\",
           inq.user_id as \"userId\",
           u.email as \"userEmail\",
           true as \"isManual\"
         FROM flight_inquiries inq
         LEFT JOIN tbl_users u ON u.id = inq.user_id
       ) all_trips
       ${whereClause}
       ORDER BY "createdAt" DESC, id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );
  }
  async updateBooking(id: string, status: string) {
    try {
      const s = (status || "").toUpperCase();
      let type: string | null = null;

      const tables = [
        { name: "bookings", col: "status", label: "booking" },
        { name: "hotel_bookings", col: "status", label: "hotel" },
        { name: "car_bookings", col: "status", label: "car" },
        { name: "transfer_bookings", col: "status", label: "transfer" },
        { name: "package_bookings", col: "booking_status", label: "package" },
        { name: "flight_inquiries", col: "status", label: "inquiry" },
      ];

      for (const t of tables) {
        const found = await this.dataSource.query(
          `SELECT id FROM ${t.name} WHERE id = ? LIMIT 1`,
          [id],
        );
        if (found.length > 0) {
          type = t.label;
          break;
        }
      }

      if (!type) {
        throw new Error(`Booking or Inquiry not found for ID: ${id}`);
      }

      let targetStatus = s;
      if (type === "inquiry") {
        if (s === "CONFIRMED" || s === "APPROVED") targetStatus = "CONTACTED";
        else if (s === "CANCELLED" || s === "REJECTED") targetStatus = "CLOSED";
        else targetStatus = s;
      } else {
        if (s === "APPROVED") targetStatus = "CONFIRMED";
        else if (s === "REJECTED") targetStatus = "CANCELLED";
        else targetStatus = s;
      }

      const targetTable = tables.find((t) => t.label === type);
      if (targetTable) {
        // Try updating. If it's an ENUM mismatch, the error will be caught.
        await this.dataSource.query(
          `UPDATE ${targetTable.name} SET ${targetTable.col} = ? WHERE id = ?`,
          [id, targetStatus],
        );
      }

      return { id, status: targetStatus, type };
    } catch (err) {
      console.error("CRITICAL: updateBooking failed", err);
      throw err;
    }
  }
  getPayments() {
    return this.dataSource.query(
      "SELECT * FROM payments ORDER BY created_at DESC LIMIT 100",
    );
  }
  getRefunds() {
    return this.dataSource.query(
      "SELECT * FROM refunds ORDER BY created_at DESC LIMIT 100",
    );
  }
  getAnalytics() {
    return this.dataSource.query(
      "SELECT * FROM analytics_reports ORDER BY period_start DESC LIMIT 30",
    );
  }
  getSettings() {
    return [];
  }
  
  async upsertSetting(key: string, value: Record<string, unknown>) {
    return { id: key, key, value, updatedAt: new Date() };
  }

  getAuditLogs() {
    return [];
  }
  async insertAuditLog(
    userId: string,
    action: string,
    module: string,
    metadata: Record<string, unknown>,
  ) {
    // No-op
  }
  getAlerts() {
    return [];
  }
  async createAdminSession(adminId: string, ipAddress: string | null) {
    return { id: 'session-id' };
  }
}
