import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';

export interface AnalyticsEventInput {
  userId: string | null;
  eventType: 'SEARCH' | 'VIEW' | 'BOOK' | 'PAYMENT';
  metadata: Record<string, unknown>;
  createdAt?: Date;
}

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly db: PostgresClient) {}

  async insertEvents(events: AnalyticsEventInput[]): Promise<void> {
    if (!events.length) return;

    const values: string[] = [];
    const params: unknown[] = [];

    events.forEach((event, index) => {
      const base = index * 4;
      values.push(`($${base + 1}, $${base + 2}, $${base + 3}::jsonb, COALESCE($${base + 4}::timestamptz, NOW()))`);
      params.push(event.userId, event.eventType, JSON.stringify(event.metadata ?? {}), event.createdAt ?? null);
    });

    await this.db.query(
      `INSERT INTO analytics_events (user_id, event_type, metadata, created_at)
       VALUES ${values.join(', ')}`,
      params,
    );
  }

  async insertBookingSnapshot(payload: {
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt?: Date;
  }): Promise<void> {
    await this.db.query(
      `INSERT INTO analytics_bookings (booking_id, user_id, amount, currency, status, created_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, NOW()))
       ON CONFLICT (booking_id) DO UPDATE
       SET status = EXCLUDED.status,
           amount = EXCLUDED.amount,
           currency = EXCLUDED.currency,
           created_at = LEAST(analytics_bookings.created_at, EXCLUDED.created_at)`,
      [payload.bookingId, payload.userId, payload.amount, payload.currency, payload.status, payload.createdAt ?? null],
    );
  }

  getRevenue(range: 'daily' | 'weekly' | 'monthly', from?: string, to?: string) {
    const periodSql = range === 'monthly' ? "date_trunc('month', created_at)" : range === 'weekly' ? "date_trunc('week', created_at)" : "date_trunc('day', created_at)";

    return this.db.query<{
      periodStart: Date;
      totalRevenue: number;
      totalBookings: number;
      avgBookingValue: number;
    }>(
      `SELECT ${periodSql} as "periodStart",
              COALESCE(SUM(amount), 0)::float8 as "totalRevenue",
              COUNT(*)::int as "totalBookings",
              COALESCE(AVG(amount), 0)::float8 as "avgBookingValue"
       FROM analytics_bookings
       WHERE status = 'CONFIRMED'
         AND ($1::date IS NULL OR created_at::date >= $1::date)
         AND ($2::date IS NULL OR created_at::date <= $2::date)
       GROUP BY 1
       ORDER BY 1 ASC`,
      [from ?? null, to ?? null],
    );
  }

  async getBookingMetrics(from?: string, to?: string) {
    return this.db.queryOne<{
      totalBookings: number;
      cancellations: number;
      successfulBookings: number;
      successRate: number;
    }>(
      `SELECT
         COUNT(*)::int as "totalBookings",
         COUNT(*) FILTER (WHERE status = 'CANCELLED')::int as "cancellations",
         COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int as "successfulBookings",
         CASE WHEN COUNT(*) = 0 THEN 0
              ELSE ROUND((COUNT(*) FILTER (WHERE status = 'CONFIRMED')::numeric / COUNT(*)::numeric) * 100, 2)::float8 END as "successRate"
       FROM analytics_bookings
       WHERE ($1::date IS NULL OR created_at::date >= $1::date)
         AND ($2::date IS NULL OR created_at::date <= $2::date)`,
      [from ?? null, to ?? null],
    );
  }

  getFunnel(from?: string, to?: string) {
    return this.db.query<{ step: string; count: number; date: string }>(
      `SELECT step, count::int as count, date::text as date
       FROM analytics_funnel
       WHERE ($1::date IS NULL OR date >= $1::date)
         AND ($2::date IS NULL OR date <= $2::date)
       ORDER BY date ASC,
         CASE step WHEN 'SEARCH' THEN 1 WHEN 'SELECT' THEN 2 WHEN 'BOOK' THEN 3 WHEN 'PAY' THEN 4 ELSE 5 END`,
      [from ?? null, to ?? null],
    );
  }

  async getUserBehavior(from?: string, to?: string) {
    const rows = await this.db.query<{ eventType: 'SEARCH' | 'VIEW' | 'BOOK' | 'PAYMENT'; total: number }>(
      `SELECT event_type as "eventType", COUNT(*)::int as total
       FROM analytics_events
       WHERE ($1::date IS NULL OR created_at::date >= $1::date)
         AND ($2::date IS NULL OR created_at::date <= $2::date)
       GROUP BY event_type`,
      [from ?? null, to ?? null],
    );

    const stats = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.eventType] = row.total;
      return acc;
    }, {});

    const searches = stats.SEARCH ?? 0;
    const bookings = stats.BOOK ?? 0;
    const conversionRate = searches === 0 ? 0 : Number(((bookings / searches) * 100).toFixed(2));

    return {
      totals: {
        searches,
        views: stats.VIEW ?? 0,
        bookings,
        payments: stats.PAYMENT ?? 0,
      },
      conversionRate,
      dropOff: {
        searchToView: Math.max(searches - (stats.VIEW ?? 0), 0),
        viewToBook: Math.max((stats.VIEW ?? 0) - bookings, 0),
        bookToPay: Math.max(bookings - (stats.PAYMENT ?? 0), 0),
      },
    };
  }

  async rebuildDailyAggregates(targetDate?: string): Promise<void> {
    await this.db.query(
      `WITH revenue AS (
         SELECT created_at::date as day,
                COALESCE(SUM(amount), 0)::numeric(14,2) as total_revenue,
                COUNT(*)::int as total_bookings,
                COALESCE(AVG(amount), 0)::numeric(14,2) as avg_booking_value
         FROM analytics_bookings
         WHERE status = 'CONFIRMED'
           AND ($1::date IS NULL OR created_at::date = $1::date)
         GROUP BY created_at::date
       )
       INSERT INTO analytics_revenue_daily (date, total_revenue, total_bookings, avg_booking_value)
       SELECT day, total_revenue, total_bookings, avg_booking_value
       FROM revenue
       ON CONFLICT (date) DO UPDATE
       SET total_revenue = EXCLUDED.total_revenue,
           total_bookings = EXCLUDED.total_bookings,
           avg_booking_value = EXCLUDED.avg_booking_value`,
      [targetDate ?? null],
    );

    await this.db.query(
      `WITH dates AS (
          SELECT DISTINCT created_at::date as day
          FROM analytics_events
          WHERE ($1::date IS NULL OR created_at::date = $1::date)
       ),
       counts AS (
         SELECT created_at::date as day,
                SUM(CASE WHEN event_type = 'SEARCH' THEN 1 ELSE 0 END)::int as search_count,
                SUM(CASE WHEN event_type = 'VIEW' THEN 1 ELSE 0 END)::int as select_count,
                SUM(CASE WHEN event_type = 'BOOK' THEN 1 ELSE 0 END)::int as book_count,
                SUM(CASE WHEN event_type = 'PAYMENT' THEN 1 ELSE 0 END)::int as pay_count
         FROM analytics_events
         WHERE ($1::date IS NULL OR created_at::date = $1::date)
         GROUP BY created_at::date
       ),
       expanded AS (
         SELECT day, 'SEARCH'::text as step, search_count as count FROM counts
         UNION ALL SELECT day, 'SELECT'::text, select_count FROM counts
         UNION ALL SELECT day, 'BOOK'::text, book_count FROM counts
         UNION ALL SELECT day, 'PAY'::text, pay_count FROM counts
       )
       INSERT INTO analytics_funnel (step, count, date)
       SELECT e.step, COALESCE(e.count, 0), e.day
       FROM expanded e
       JOIN dates d ON d.day = e.day
       ON CONFLICT (step, date) DO UPDATE SET count = EXCLUDED.count`,
      [targetDate ?? null],
    );
  }
}
