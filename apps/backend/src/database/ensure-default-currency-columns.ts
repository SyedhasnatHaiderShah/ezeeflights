import { MysqlClient } from "./mysql.client";

const TABLES_WITH_CURRENCY = [
  "bookings",
  "hotel_bookings",
  "car_bookings",
  "transfer_bookings",
  "package_bookings",
] as const;

/**
 * Ensures `default_currency` exists on booking tables (provider/original currency at booking time).
 * Safe to run on every startup — uses IF NOT EXISTS.
 */
export async function ensureDefaultCurrencyColumns(
  db: MysqlClient,
): Promise<void> {
  for (const table of TABLES_WITH_CURRENCY) {
    const exists = await db.queryOne<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      [table],
    );
    if (!exists?.exists) continue;

    await db.query(
      `ALTER TABLE ${table}
       ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3)`,
    );

    // Backfill: use existing currency where default was not set
    await db.query(
      `UPDATE ${table}
       SET default_currency = UPPER(TRIM(currency))
       WHERE default_currency IS NULL
         AND currency IS NOT NULL
         AND TRIM(currency) <> ''`,
    );
  }
}
