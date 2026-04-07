# Analytics & Reporting Module

## SQL Schema

Run migration:

```bash
psql "$DATABASE_URL" -f sql/migrations/008_analytics_reporting_module.sql
```

Tables created:
- `analytics_events` (partitioned by `created_at`)
- `analytics_bookings` (partitioned by `created_at`)
- `analytics_revenue_daily`
- `analytics_funnel`

Indexes:
- `analytics_events(created_at)`
- `analytics_events(user_id)`
- `analytics_bookings(created_at)`
- `analytics_bookings(user_id)`
- `analytics_funnel(date, step)`

## API Endpoints (Admin only)

All endpoints require JWT + `admin` role.

- `GET /api/analytics/revenue?range=daily|weekly|monthly&from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/analytics/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/analytics/funnel?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /api/analytics/user-behavior?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Real-time Event Tracking

`EventTrackerService` captures and asynchronously flushes:
- `flight_search`
- `hotel_search`
- `booking_created`
- `payment_success`
- `booking_cancelled`

Flow:
1. Event accepted in memory queue (non-blocking).
2. Periodic flush (1 second / 100 events threshold).
3. Batch insert to `analytics_events`.

## Aggregations & Cron Strategy

`AnalyticsService.aggregateDaily()`:
- syncs booking snapshots from `bookings` into `analytics_bookings`
- rebuilds `analytics_revenue_daily`
- rebuilds `analytics_funnel`

A periodic in-process scheduler runs every 5 minutes.
For production at scale, trigger this from external cron/worker.

## Data Privacy

- APIs are admin-guarded.
- Event metadata should exclude PII and payment secrets.
- User analysis endpoints return aggregated counts/rates only.
