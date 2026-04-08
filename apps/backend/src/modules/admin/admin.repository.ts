import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { AdminPermissionAction, CreateRolePermissionDto } from './dto/admin.dto';

@Injectable()
export class AdminRepository {
  constructor(private readonly db: PostgresClient) {}

  getAdminByUserId(userId: string) {
    return this.db.queryOne<{ id: string; userId: string; roleId: string; roleName: string }>(
      `SELECT au.id, au.user_id as "userId", au.role_id as "roleId", r.name as "roleName"
       FROM admin_users au
       JOIN roles r ON r.id = au.role_id
       WHERE au.user_id = $1`,
      [userId],
    );
  }

  findUserWithPasswordByEmail(email: string) {
    return this.db.queryOne<{ id: string; email: string; passwordHash: string | null }>(
      `SELECT id, email, password_hash as "passwordHash" FROM users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
  }

  async hasModulePermission(userId: string, module: string, action: AdminPermissionAction): Promise<boolean> {
    const row = await this.db.queryOne<{ hasAccess: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM admin_users au
         JOIN role_permissions rp ON rp.role_id = au.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE au.user_id = $1
           AND upper(coalesce(p.module, split_part(p.slug, '.', 1))) = upper($2)
           AND upper(coalesce(p.action, split_part(p.slug, '.', 2))) = upper($3)
       ) as "hasAccess"`,
      [userId, module, action],
    );
    return row?.hasAccess ?? false;
  }

  async listRoles() {
    return this.db.query<{ id: string; name: string }>('SELECT id, name FROM roles ORDER BY name');
  }

  async listRolePermissions(roleId: string) {
    return this.db.query<{ module: string; action: string }>(
      `SELECT coalesce(p.module, split_part(p.slug, '.', 1)) as module,
              upper(coalesce(p.action, split_part(p.slug, '.', 2))) as action
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [roleId],
    );
  }

  createRole(name: string) {
    return this.db.queryOne<{ id: string; name: string }>('INSERT INTO roles (name, slug) VALUES ($1, lower(replace($1,\' \' ,\'-\'))) RETURNING id, name', [name]);
  }

  async setRolePermissions(roleId: string, permissions: CreateRolePermissionDto[]) {
    await this.db.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
    for (const permission of permissions) {
      const slug = `${permission.module.toLowerCase()}.${permission.action.toLowerCase()}`;
      const p = await this.db.queryOne<{ id: string }>(
        `INSERT INTO permissions (slug, module, action, description)
         VALUES ($1, upper($2), upper($3), $4)
         ON CONFLICT (slug) DO UPDATE SET module = EXCLUDED.module, action = EXCLUDED.action
         RETURNING id`,
        [slug, permission.module, permission.action, `Admin ${permission.action} access to ${permission.module}`],
      );
      if (p) {
        await this.db.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [roleId, p.id],
        );
      }
    }
  }

  updateRoleName(roleId: string, name: string) {
    return this.db.queryOne<{ id: string; name: string }>(
      `UPDATE roles SET name = $2, slug = lower(replace($2,' ','-')), updated_at = NOW() WHERE id = $1 RETURNING id, name`,
      [roleId, name],
    );
  }

  listAdminUsers() {
    return this.db.query<{ id: string; email: string; roleId: string; roleName: string }>(
      `SELECT u.id, u.email, au.role_id as "roleId", r.name as "roleName"
       FROM admin_users au
       JOIN users u ON u.id = au.user_id
       JOIN roles r ON r.id = au.role_id
       ORDER BY u.email`,
    );
  }

  assignAdminRole(userId: string, roleId: string) {
    return this.db.query(
      `INSERT INTO admin_users (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET role_id = excluded.role_id`,
      [userId, roleId],
    );
  }

  dashboardSummary() {
    return this.db.queryOne<{ totalRevenue: string; totalBookings: string; activeUsers: string; conversionRate: string }>(
      `SELECT
        coalesce((SELECT sum(amount)::text FROM payments WHERE status in ('SUCCESS', 'REFUNDED')), '0') as "totalRevenue",
        coalesce((SELECT count(*)::text FROM bookings), '0') as "totalBookings",
        coalesce((SELECT count(*)::text FROM users WHERE created_at >= NOW() - INTERVAL '30 days'), '0') as "activeUsers",
        coalesce((SELECT round((count(*) FILTER (WHERE status = 'CONFIRMED')::numeric / nullif(count(*),0))*100,2)::text FROM bookings), '0') as "conversionRate"`,
    );
  }

  async chartSeries() {
    const bookingsTrend = await this.db.query<{ date: string; value: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, count(*)::text as value
       FROM bookings
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY 1
       ORDER BY 1`,
    );
    const revenueTrend = await this.db.query<{ date: string; value: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, coalesce(sum(amount),0)::text as value
       FROM payments
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY 1
       ORDER BY 1`,
    );
    const cancellations = await this.db.query<{ date: string; value: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date, count(*)::text as value
       FROM bookings
       WHERE status = 'CANCELLED' AND created_at >= NOW() - INTERVAL '30 days'
       GROUP BY 1
       ORDER BY 1`,
    );
    return { bookingsTrend, revenueTrend, cancellations };
  }

  getBookings() { return this.db.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 100'); }
  updateBooking(id: string, status: string) {
    return this.db.queryOne('UPDATE bookings SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
  }
  getPayments() { return this.db.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100'); }
  getRefunds() { return this.db.query('SELECT * FROM refunds ORDER BY created_at DESC LIMIT 100'); }
  getAnalytics() { return this.db.query('SELECT * FROM analytics_reports ORDER BY period_start DESC LIMIT 30'); }
  getSettings() { return this.db.query('SELECT id, key, value, updated_at as "updatedAt" FROM system_settings ORDER BY key'); }
  upsertSetting(key: string, value: Record<string, unknown>) {
    return this.db.queryOne(
      `INSERT INTO system_settings (key, value, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING id, key, value, updated_at as "updatedAt"`,
      [key, JSON.stringify(value)],
    );
  }
  getAuditLogs() { return this.db.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200'); }
  insertAuditLog(userId: string, action: string, module: string, metadata: Record<string, unknown>) {
    return this.db.query('INSERT INTO audit_logs (user_id, action, module, metadata) VALUES ($1, $2, $3, $4::jsonb)', [userId, action, module, JSON.stringify(metadata)]);
  }
  getAlerts() { return this.db.query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100'); }
  createAdminSession(adminId: string, ipAddress: string | null) {
    return this.db.queryOne<{ id: string }>(
      'INSERT INTO admin_sessions (admin_id, ip_address, login_time) VALUES ($1, $2, NOW()) RETURNING id',
      [adminId, ipAddress],
    );
  }
}
