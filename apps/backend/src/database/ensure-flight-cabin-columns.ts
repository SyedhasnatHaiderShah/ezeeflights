import { MysqlClient } from "./mysql.client";

/** Persist Travelport cabin list on flights for booking UI. */
export async function ensureFlightCabinColumns(
  db: MysqlClient,
): Promise<void> {
  const exists = await db.queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'flights'
    ) AS exists`,
  );
  if (!exists?.exists) return;

  await db.query(
    `ALTER TABLE flights
     ADD COLUMN IF NOT EXISTS available_cabin_classes JSONB`,
  );
}
