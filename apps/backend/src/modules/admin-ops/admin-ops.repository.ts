import { Injectable } from '@nestjs/common';
import { decryptField, encryptField } from '../../common/crypto/field-encryption';
import { PostgresClient } from '../../database/postgres.client';

@Injectable()
export class AdminOpsRepository {
  constructor(private readonly db: PostgresClient) {}

  async revenueOverview(from?: string, to?: string) {
    return this.db.queryOne<{
      dailyRevenue: number;
      monthlyRevenue: number;
      yearlyRevenue: number;
      averageOrderValue: number;
      revenuePerUser: number;
      paymentSuccessRate: number;
      refundRatio: number;
    }>(
      `WITH paid AS (
         SELECT p.* FROM payments p
         WHERE p.status IN ('SUCCESS', 'REFUNDED')
           AND ($1::date IS NULL OR p.created_at::date >= $1::date)
           AND ($2::date IS NULL OR p.created_at::date <= $2::date)
       ),
       refunds AS (
         SELECT COALESCE(SUM(amount), 0)::float8 as total
         FROM refunds
         WHERE status IN ('SUCCESS', 'PROCESSED')
           AND ($1::date IS NULL OR created_at::date >= $1::date)
           AND ($2::date IS NULL OR created_at::date <= $2::date)
       ),
       payment_stats AS (
         SELECT COUNT(*) FILTER (WHERE status = 'SUCCESS')::float8 as success_count,
                COUNT(*)::float8 as total_count
         FROM payments
         WHERE ($1::date IS NULL OR created_at::date >= $1::date)
           AND ($2::date IS NULL OR created_at::date <= $2::date)
       )
       SELECT
         COALESCE(SUM(CASE WHEN paid.created_at::date = CURRENT_DATE THEN paid.amount ELSE 0 END), 0)::float8 as "dailyRevenue",
         COALESCE(SUM(CASE WHEN date_trunc('month', paid.created_at) = date_trunc('month', NOW()) THEN paid.amount ELSE 0 END), 0)::float8 as "monthlyRevenue",
         COALESCE(SUM(CASE WHEN date_trunc('year', paid.created_at) = date_trunc('year', NOW()) THEN paid.amount ELSE 0 END), 0)::float8 as "yearlyRevenue",
         COALESCE(AVG(paid.amount), 0)::float8 as "averageOrderValue",
         CASE WHEN COUNT(DISTINCT paid.user_id) = 0 THEN 0
           ELSE (SUM(paid.amount) / COUNT(DISTINCT paid.user_id))::float8 END as "revenuePerUser",
         CASE WHEN ps.total_count = 0 THEN 0 ELSE ROUND((ps.success_count / ps.total_count) * 100, 2)::float8 END as "paymentSuccessRate",
         CASE WHEN COALESCE(SUM(paid.amount),0) = 0 THEN 0 ELSE ROUND((r.total / SUM(paid.amount)) * 100, 2)::float8 END as "refundRatio"
       FROM paid
       CROSS JOIN refunds r
       CROSS JOIN payment_stats ps`,
      [from ?? null, to ?? null],
    );
  }

  revenueByModule(from?: string, to?: string) {
    return this.db.query<{
      module: string;
      revenue: number;
      bookings: number;
    }>(
      `SELECT module,
              COALESCE(SUM(total_amount), 0)::float8 as revenue,
              COUNT(*)::int as bookings
       FROM (
         SELECT CASE
             WHEN b.flight_id IS NOT NULL THEN 'Flights'
             WHEN b.hotel_id IS NOT NULL THEN 'Hotels'
             ELSE 'Add-ons'
           END as module,
           b.total_amount
         FROM bookings b
         WHERE b.status = 'CONFIRMED'
           AND ($1::date IS NULL OR b.created_at::date >= $1::date)
           AND ($2::date IS NULL OR b.created_at::date <= $2::date)
       ) grouped
       GROUP BY module
       ORDER BY revenue DESC`,
      [from ?? null, to ?? null],
    );
  }

  operationsStatus(from?: string, to?: string) {
    return this.db.queryOne<{
      activeBookings: number;
      pendingBookings: number;
      failedBookings: number;
      cancellationRate: number;
      slaBreaches: number;
      avgProcessingTimeSec: number;
    }>(
      `WITH scope AS (
         SELECT * FROM bookings
         WHERE ($1::date IS NULL OR created_at::date >= $1::date)
           AND ($2::date IS NULL OR created_at::date <= $2::date)
       ),
       sla AS (
         SELECT COUNT(*) FILTER (WHERE status = 'DELAYED')::int as breaches,
                COALESCE(AVG(EXTRACT(EPOCH FROM actual_time - expected_time)), 0)::float8 as avg_delay
         FROM sla_tracking
         WHERE ($1::date IS NULL OR expected_time::date >= $1::date)
           AND ($2::date IS NULL OR expected_time::date <= $2::date)
       )
       SELECT
         COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int as "activeBookings",
         COUNT(*) FILTER (WHERE status = 'PENDING')::int as "pendingBookings",
         COUNT(*) FILTER (WHERE status = 'FAILED')::int as "failedBookings",
         CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND((COUNT(*) FILTER (WHERE status = 'CANCELLED')::numeric / COUNT(*)::numeric) * 100, 2)::float8 END as "cancellationRate",
         sla.breaches::int as "slaBreaches",
         GREATEST(sla.avg_delay, 0)::float8 as "avgProcessingTimeSec"
       FROM scope
       CROSS JOIN sla`,
      [from ?? null, to ?? null],
    );
  }

  operationsSla(from?: string, to?: string) {
    return this.db.query<{
      bookingId: string;
      expectedTime: Date;
      actualTime: Date;
      status: 'ON_TIME' | 'DELAYED';
      delayMinutes: number;
    }>(
      `SELECT booking_id as "bookingId", expected_time as "expectedTime", actual_time as "actualTime", status,
        GREATEST(EXTRACT(EPOCH FROM actual_time - expected_time) / 60, 0)::float8 as "delayMinutes"
       FROM sla_tracking
       WHERE ($1::date IS NULL OR expected_time::date >= $1::date)
         AND ($2::date IS NULL OR expected_time::date <= $2::date)
       ORDER BY expected_time DESC
       LIMIT 200`,
      [from ?? null, to ?? null],
    );
  }

  settlements() {
    return this.db.query<{
      id: string;
      provider: string;
      totalAmount: number;
      settledAmount: number;
      pendingAmount: number;
      createdAt: Date;
    }>(
      `SELECT id, provider,
              total_amount::float8 as "totalAmount",
              settled_amount::float8 as "settledAmount",
              pending_amount::float8 as "pendingAmount",
              created_at as "createdAt"
       FROM settlements
       ORDER BY created_at DESC`,
    );
  }

  async reconciliationLogs() {
    const rows = await this.db.query<{
      id: string;
      transactionId: string;
      status: 'MATCHED' | 'MISMATCH';
      createdAt: Date;
    }>(
      `SELECT id, transaction_id as "transactionId", status, created_at as "createdAt"
       FROM reconciliation_logs
       ORDER BY created_at DESC
       LIMIT 500`,
    );

    return rows.map((row) => {
      try {
        return { ...row, transactionId: decryptField(row.transactionId) };
      } catch {
        return row;
      }
    });
  }

  async storeReconciliationLog(transactionId: string, status: 'MATCHED' | 'MISMATCH') {
    return this.db.queryOne(
      `INSERT INTO reconciliation_logs (transaction_id, status)
       VALUES ($1, $2)
       RETURNING id`,
      [encryptField(transactionId), status],
    );
  }

  liveBookings(limit = 50) {
    return this.db.query(
      `SELECT id, user_id as "userId", status, total_amount::float8 as "totalAmount", currency, created_at as "createdAt"
       FROM bookings
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
  }

  systemHealth() {
    return this.db.query(
      `SELECT id, service_name as "serviceName", status, response_time::float8 as "responseTime", checked_at as "checkedAt"
       FROM system_health
       ORDER BY checked_at DESC
       LIMIT 200`,
    );
  }

  async getInsight(type: string) {
    return this.db.queryOne<{ id: string; type: string; data: Record<string, unknown>; generatedAt: Date }>(
      `SELECT id, type, data, generated_at as "generatedAt"
       FROM insights_cache
       WHERE type = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [type],
    );
  }

  upsertInsight(type: string, data: Record<string, unknown>) {
    return this.db.queryOne(
      `INSERT INTO insights_cache (type, data, generated_at)
       VALUES ($1, $2::jsonb, NOW())
       RETURNING id`,
      [type, JSON.stringify(data)],
    );
  }

  topDestinations(from?: string, to?: string) {
    return this.db.query<{ destination: string; bookings: number }>(
      `SELECT f.arrival_airport as destination, COUNT(*)::int as bookings
       FROM bookings b
       JOIN flights f ON f.id = b.flight_id
       WHERE b.status = 'CONFIRMED'
         AND ($1::date IS NULL OR b.created_at::date >= $1::date)
         AND ($2::date IS NULL OR b.created_at::date <= $2::date)
       GROUP BY f.arrival_airport
       ORDER BY bookings DESC
       LIMIT 10`,
      [from ?? null, to ?? null],
    );
  }

  trendData(from?: string, to?: string, granularity: 'hour' | 'day' | 'week' = 'day') {
    const bucket = granularity === 'hour' ? "date_trunc('hour', created_at)" : granularity === 'week' ? "date_trunc('week', created_at)" : "date_trunc('day', created_at)";

    return this.db.query<{ bucket: string; bookings: number; revenue: number }>(
      `SELECT to_char(${bucket}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as bucket,
              COUNT(*)::int as bookings,
              COALESCE(SUM(total_amount), 0)::float8 as revenue
       FROM bookings
       WHERE status = 'CONFIRMED'
         AND ($1::date IS NULL OR created_at::date >= $1::date)
         AND ($2::date IS NULL OR created_at::date <= $2::date)
       GROUP BY 1
       ORDER BY 1`,
      [from ?? null, to ?? null],
    );
  }
}
