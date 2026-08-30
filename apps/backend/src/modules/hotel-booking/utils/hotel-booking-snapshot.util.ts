import { MysqlClient } from "../../../database/mysql.client";

let snapshotColumnsCached: boolean | null = null;
let hotelBookingsColumns: Set<string> | null = null;
let bookingGuestsColumns: Set<string> | null = null;

export async function hasHotelBookingSnapshotColumns(
  db: MysqlClient,
): Promise<boolean> {
  if (snapshotColumnsCached !== null) {
    return snapshotColumnsCached;
  }

  const row = await db.queryOne<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'hotel_bookings'
        AND column_name = 'hotel_name'
    ) AS exists`,
  );

  snapshotColumnsCached = row?.exists === true;
  return snapshotColumnsCached;
}

export async function getHotelBookingsColumns(
  db: MysqlClient,
): Promise<Set<string>> {
  if (hotelBookingsColumns !== null) {
    return hotelBookingsColumns;
  }

  try {
    const rows = await db.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'hotel_bookings'`,
    );
    const colList = Array.isArray(rows) ? rows : (rows as any)?.rows || [];
    hotelBookingsColumns = new Set(colList.map((r: any) => r.column_name));
  } catch {
    hotelBookingsColumns = new Set([
      'id', 'user_id', 'hotel_id', 'total_price', 'check_in_date', 'check_out_date', 'status', 'payment_status', 'currency', 'created_at', 'updated_at'
    ]);
  }
  return hotelBookingsColumns;
}

export async function getBookingGuestsColumns(
  db: MysqlClient,
): Promise<Set<string>> {
  if (bookingGuestsColumns !== null) {
    return bookingGuestsColumns;
  }

  try {
    const rows = await db.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'booking_guests'`,
    );
    const colList = Array.isArray(rows) ? rows : (rows as any)?.rows || [];
    bookingGuestsColumns = new Set(colList.map((r: any) => r.column_name));
  } catch {
    bookingGuestsColumns = new Set([
      'id', 'booking_id', 'room_id', 'full_name', 'age', 'type', 'created_at', 'updated_at'
    ]);
  }
  return bookingGuestsColumns;
}

export function resetHotelBookingSnapshotCache(): void {
  snapshotColumnsCached = null;
  hotelBookingsColumns = null;
  bookingGuestsColumns = null;
}
