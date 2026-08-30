import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { WorldrixCrmMysqlClient } from "../../database/worldrix-crm-mysql.client";
import { WorldrixTableDef } from "./worldrix-tables.registry";

type Row = Record<string, unknown>;

@Injectable()
export class WorldrixCrmRepository {
  constructor(private readonly db: WorldrixCrmMysqlClient) {}

  private selectColumns(def: WorldrixTableDef): string {
    const visible = def.columns.filter((c) => !def.hidden.includes(c));
    return visible.map((c) => `\`${c}\``).join(", ");
  }

  async list(
    def: WorldrixTableDef,
    page: number,
    limit: number,
  ): Promise<{ data: Row[]; total: number }> {
    const offset = (page - 1) * limit;

    const countRows = await this.db.query<{ total: number }>(
      `SELECT COUNT(*) AS total FROM \`${def.table}\``,
    );
    const total = Number(countRows[0]?.total ?? 0);

    const data = await this.db.query<Row>(
      `SELECT ${this.selectColumns(def)} FROM \`${def.table}\`
       ORDER BY \`${def.pk}\` DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );

    return { data, total };
  }

  async findById(def: WorldrixTableDef, id: string | number): Promise<Row | null> {
    const rows = await this.db.query<Row>(
      `SELECT ${this.selectColumns(def)} FROM \`${def.table}\` WHERE \`${def.pk}\` = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  /** Keep only writable keys the client is allowed to set. */
  private sanitize(def: WorldrixTableDef, body: Row): Row {
    const clean: Row = {};
    for (const key of def.writable) {
      if (body[key] !== undefined) clean[key] = body[key];
    }
    return clean;
  }

  async create(def: WorldrixTableDef, body: Row): Promise<Row | null> {
    const clean = this.sanitize(def, body);

    const columns: string[] = [];
    const placeholders: string[] = [];
    const values: unknown[] = [];

    let generatedId: string | null = null;
    if (!def.pkAuto) {
      generatedId = randomUUID();
      columns.push(`\`${def.pk}\``);
      placeholders.push("?");
      values.push(generatedId);
    }

    for (const [key, value] of Object.entries(clean)) {
      columns.push(`\`${key}\``);
      placeholders.push("?");
      values.push(value);
    }

    for (const col of def.nowOnInsert) {
      if (clean[col] === undefined) {
        columns.push(`\`${col}\``);
        placeholders.push("NOW()");
      }
    }

    const insertId = await this.db.insert(
      `INSERT INTO \`${def.table}\` (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`,
      values,
    );

    const id = generatedId ?? insertId;
    return this.findById(def, id as string | number);
  }

  async update(
    def: WorldrixTableDef,
    id: string | number,
    body: Row,
  ): Promise<Row | null> {
    const clean = this.sanitize(def, body);
    const sets: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(clean)) {
      sets.push(`\`${key}\` = ?`);
      values.push(value);
    }

    if (def.updatedAtColumn && clean[def.updatedAtColumn] === undefined) {
      sets.push(`\`${def.updatedAtColumn}\` = NOW()`);
    }

    if (sets.length > 0) {
      values.push(id);
      await this.db.query(
        `UPDATE \`${def.table}\` SET ${sets.join(", ")} WHERE \`${def.pk}\` = ?`,
        values,
      );
    }

    return this.findById(def, id);
  }

  async remove(def: WorldrixTableDef, id: string | number): Promise<void> {
    await this.db.query(
      `DELETE FROM \`${def.table}\` WHERE \`${def.pk}\` = ?`,
      [id],
    );
  }

  async getFlightDetails(customerId: string | number): Promise<{ id: number; customerId: number; outBoundFlights: string; inBoundFlights: string } | null> {
    const rows = await this.db.query<any>(
      `SELECT * FROM \`tbl_flightdetailshtml\` WHERE \`customerId\` = ? LIMIT 1`,
      [customerId]
    );
    return rows[0] ?? null;
  }

  /**
   * Fetches complete booking data across all CRM tables in a single operation:
   * 1. tbl_customerdetails (where bookingRef = ? or id = ?)
   * 2. tbl_customer (where customerId = ?)
   * 3. refund_shield (where booking_ref = ?)
   * 4. refundshieldbookingscnfrm (where BookingRef = ?)
   * 5. affirmbookingforms (where id = ?)
   * 6. affirmpayment (where BookingRef = ?)
   * 7. tbl_flightdetailshtml (where customerId = ?)
   */
  async getCompleteBookingDetails(params: {
    bookingRef?: string;
    customerId?: string;
  }): Promise<any> {
    let bookingRef = params.bookingRef?.trim() || "";
    let customerId = params.customerId?.trim() || "";

    const safeQuery = async (sql: string, sqlParams: any[]) => {
      try {
        return await this.db.query<any>(sql, sqlParams);
      } catch (err: any) {
        return [];
      }
    };

    const extractId = (row: any): string => {
      if (!row) return "";
      const val =
        row.Id ??
        row.id ??
        row.CustomerId ??
        row.customerId ??
        row.cId ??
        "";
      return val !== null && val !== undefined ? String(val).trim() : "";
    };

    const extractBookingRef = (row: any): string => {
      if (!row) return "";
      const val =
        row.bookingRef ??
        row.BookingRef ??
        row.booking_ref ??
        "";
      return val !== null && val !== undefined ? String(val).trim() : "";
    };

    // Dynamically resolve customerId / bookingRef via tbl_customerdetails
    if (bookingRef || customerId) {
      const targetParam = bookingRef || customerId;
      const rows = await safeQuery(
        `SELECT * FROM \`tbl_customerdetails\` WHERE \`bookingRef\` = ? OR \`Id\` = ? OR \`id\` = ? LIMIT 1`,
        [targetParam, targetParam, targetParam],
      );
      if (rows[0]) {
        if (!bookingRef) bookingRef = extractBookingRef(rows[0]);
        if (!customerId) customerId = extractId(rows[0]);
      }
    }

    // Secondary fallback: if customerId is still missing, lookup refundshieldbookingscnfrm by BookingRef
    if (bookingRef && !customerId) {
      const rows = await safeQuery(
        `SELECT * FROM \`refundshieldbookingscnfrm\` WHERE \`BookingRef\` = ? LIMIT 1`,
        [bookingRef],
      );
      if (rows[0]) {
        customerId = extractId(rows[0]);
      }
    }

    // Tertiary fallback: lookup affirmbookingforms by UniqueId or PhoneNo or Email
    if (bookingRef && !customerId) {
      const rows = await safeQuery(
        `SELECT * FROM \`affirmbookingforms\` WHERE \`UniqueId\` = ? OR \`PhoneNo\` = ? LIMIT 1`,
        [bookingRef, bookingRef],
      );
      if (rows[0]) {
        customerId = extractId(rows[0]);
      }
    }

    if (!bookingRef && !customerId) {
      return { found: false };
    }

    // Execute queries in parallel using exact table/column case sensitivity
    const [
      customerDetailsRows,
      customerRows,
      refundShieldRows,
      refundShieldCnfrmRows,
      affirmBookingFormsRows,
      affirmPaymentRows,
      flightDetailsRows,
    ] = await Promise.all([
      // 1. tbl_customerdetails: bookingRef / Id
      safeQuery(
        `SELECT * FROM \`tbl_customerdetails\` WHERE \`bookingRef\` = ? OR \`Id\` = ? OR \`id\` = ? LIMIT 1`,
        [bookingRef, customerId || 0, customerId || 0],
      ),
      // 2. tbl_customer: customerId
      safeQuery(
        `SELECT * FROM \`tbl_customer\` WHERE \`customerId\` = ?`,
        [customerId || 0],
      ),
      // 3. refund_shield: booking_ref
      safeQuery(
        `SELECT * FROM \`refund_shield\` WHERE \`booking_ref\` = ? LIMIT 1`,
        [bookingRef],
      ),
      // 4. refundshieldbookingscnfrm: BookingRef
      safeQuery(
        `SELECT * FROM \`refundshieldbookingscnfrm\` WHERE \`BookingRef\` = ? LIMIT 1`,
        [bookingRef],
      ),
      // 5. affirmbookingforms: Id / id / UniqueId
      safeQuery(
        `SELECT * FROM \`affirmbookingforms\` WHERE \`Id\` = ? OR \`id\` = ? OR \`UniqueId\` = ?`,
        [customerId || 0, customerId || 0, bookingRef || ""],
      ),
      // 6. affirmpayment: BookingRef
      safeQuery(
        `SELECT * FROM \`affirmpayment\` WHERE \`BookingRef\` = ?`,
        [bookingRef],
      ),
      // 7. tbl_flightdetailshtml: customerId
      safeQuery(
        `SELECT * FROM \`tbl_flightdetailshtml\` WHERE \`customerId\` = ? LIMIT 1`,
        [customerId || 0],
      ),
    ]);

    // Final resolution of customerId / bookingRef if missing
    if (!customerId) {
      customerId =
        extractId(customerDetailsRows[0]) ||
        extractId(refundShieldCnfrmRows[0]) ||
        extractId(affirmBookingFormsRows[0]) ||
        extractId(customerRows[0]);
    }

    if (!bookingRef) {
      bookingRef =
        extractBookingRef(customerDetailsRows[0]) ||
        extractBookingRef(refundShieldRows[0]) ||
        extractBookingRef(refundShieldCnfrmRows[0]) ||
        extractBookingRef(affirmPaymentRows[0]);
    }

    const found =
      Boolean(customerDetailsRows[0]) ||
      customerRows.length > 0 ||
      Boolean(refundShieldRows[0]) ||
      Boolean(refundShieldCnfrmRows[0]) ||
      affirmBookingFormsRows.length > 0 ||
      affirmPaymentRows.length > 0 ||
      Boolean(flightDetailsRows[0]);

    return {
      found,
      bookingRef,
      customerId,
      customerDetails: customerDetailsRows[0] || null,
      customers: customerRows || [],
      refundShield: refundShieldRows[0] || null,
      refundShieldCnfrm: refundShieldCnfrmRows[0] || null,
      affirmBookingForms: affirmBookingFormsRows || [],
      affirmPayments: affirmPaymentRows || [],
      flightDetailsHtml: flightDetailsRows[0] || null,
    };
  }
}

