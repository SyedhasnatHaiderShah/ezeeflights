import { Injectable } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';

export interface AnalyticsEventInput {
  userId: string | null;
  eventType: 'SEARCH' | 'VIEW' | 'BOOK' | 'PAYMENT';
  metadata: Record<string, unknown>;
  createdAt?: Date;
}

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly db: MysqlClient) {}

  async insertEvents(events: AnalyticsEventInput[]): Promise<void> {
    if (!events.length) return;

    const values: string[] = [];
    const params: unknown[] = [];

    events.forEach((event) => {
      values.push(`(?, ?, ?, COALESCE(?, NOW()))`);
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
       VALUES (?, ?, ?, ?, ?, COALESCE(?, NOW()))
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       amount = VALUES(amount),
       currency = VALUES(currency),
       created_at = LEAST(analytics_bookings.created_at, VALUES(created_at))`,
      [payload.bookingId, payload.userId, payload.amount, payload.currency, payload.status, payload.createdAt ?? null],
    );
  }

  getRevenue(range: 'daily' | 'weekly' | 'monthly', from?: string, to?: string) {
    let periodSql = '';
    if (range === 'monthly') {
      periodSql = "DATE_FORMAT(created_at, '%Y-%m-01 00:00:00')";
    } else if (range === 'weekly') {
      periodSql = "DATE_FORMAT(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), '%Y-%m-%d 00:00:00')";
    } else {
      periodSql = "DATE_FORMAT(created_at, '%Y-%m-%d 00:00:00')";
    }

    return this.db.query<{
      periodStart: Date;
      totalRevenue: number;
      totalBookings: number;
      avgBookingValue: number;
    }>(
      `SELECT ${periodSql} as periodStart,
              COALESCE(SUM(amount), 0) as totalRevenue,
              COUNT(*) as totalBookings,
              COALESCE(AVG(amount), 0) as avgBookingValue
       FROM analytics_bookings
       WHERE status = 'CONFIRMED'
         AND (? IS NULL OR DATE(created_at) >= DATE(?))
         AND (? IS NULL OR DATE(created_at) <= DATE(?))
       GROUP BY 1
       ORDER BY 1 ASC`,
      [from ?? null, from ?? null, to ?? null, to ?? null],
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
         COUNT(*) as totalBookings,
         SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancellations,
         SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as successfulBookings,
         CASE WHEN COUNT(*) = 0 THEN 0
              ELSE ROUND((SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) END as successRate
       FROM analytics_bookings
       WHERE (? IS NULL OR DATE(created_at) >= DATE(?))
         AND (? IS NULL OR DATE(created_at) <= DATE(?))`,
      [from ?? null, from ?? null, to ?? null, to ?? null],
    );
  }

  getFunnel(from?: string, to?: string) {
    return this.db.query<{ step: string; count: number; date: string }>(
      `SELECT step, CAST(count AS SIGNED) as count, DATE_FORMAT(date, '%Y-%m-%d') as date
       FROM analytics_funnel
       WHERE (? IS NULL OR date >= ?)
         AND (? IS NULL OR date <= ?)
       ORDER BY date ASC,
         CASE step WHEN 'SEARCH' THEN 1 WHEN 'SELECT' THEN 2 WHEN 'BOOK' THEN 3 WHEN 'PAY' THEN 4 ELSE 5 END`,
      [from ?? null, from ?? null, to ?? null, to ?? null],
    );
  }

  async getUserBehavior(from?: string, to?: string) {
    const rows = await this.db.query<{ eventType: 'SEARCH' | 'VIEW' | 'BOOK' | 'PAYMENT'; total: number }>(
      `SELECT event_type as eventType, COUNT(*) as total
       FROM analytics_events
       WHERE (? IS NULL OR DATE(created_at) >= DATE(?))
         AND (? IS NULL OR DATE(created_at) <= DATE(?))
       GROUP BY event_type`,
      [from ?? null, from ?? null, to ?? null, to ?? null],
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
      `INSERT INTO analytics_revenue_daily (date, total_revenue, total_bookings, avg_booking_value)
       SELECT DATE(created_at) as day,
              CAST(COALESCE(SUM(amount), 0) AS DECIMAL(14,2)) as total_revenue,
              COUNT(*) as total_bookings,
              CAST(COALESCE(AVG(amount), 0) AS DECIMAL(14,2)) as avg_booking_value
       FROM analytics_bookings
       WHERE status = 'CONFIRMED'
         AND (? IS NULL OR DATE(created_at) = DATE(?))
       GROUP BY DATE(created_at)
       ON DUPLICATE KEY UPDATE
       total_revenue = VALUES(total_revenue),
       total_bookings = VALUES(total_bookings),
       avg_booking_value = VALUES(avg_booking_value)`,
      [targetDate ?? null, targetDate ?? null],
    );

    await this.db.query(
      `WITH dates AS (
          SELECT DISTINCT DATE(created_at) as day
          FROM analytics_events
          WHERE (? IS NULL OR DATE(created_at) = DATE(?))
       ),
       counts AS (
          SELECT DATE(created_at) as day,
                 SUM(CASE WHEN event_type = 'SEARCH' THEN 1 ELSE 0 END) as search_count,
                 SUM(CASE WHEN event_type = 'VIEW' THEN 1 ELSE 0 END) as select_count,
                 SUM(CASE WHEN event_type = 'BOOK' THEN 1 ELSE 0 END) as book_count,
                 SUM(CASE WHEN event_type = 'PAYMENT' THEN 1 ELSE 0 END) as pay_count
          FROM analytics_events
          WHERE (? IS NULL OR DATE(created_at) = DATE(?))
          GROUP BY DATE(created_at)
       ),
       expanded AS (
          SELECT day, 'SEARCH' as step, search_count as count FROM counts
          UNION ALL SELECT day, 'SELECT' as step, select_count FROM counts
          UNION ALL SELECT day, 'BOOK' as step, book_count FROM counts
          UNION ALL SELECT day, 'PAY' as step, pay_count FROM counts
       )
       INSERT INTO analytics_funnel (step, count, date)
       SELECT e.step, COALESCE(e.count, 0), e.day
       FROM expanded e
       JOIN dates d ON d.day = e.day
       ON DUPLICATE KEY UPDATE count = VALUES(count)`,
      [targetDate ?? null, targetDate ?? null, targetDate ?? null, targetDate ?? null],
    );
  }
}
