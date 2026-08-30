import { Injectable, Logger } from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import {
  CheapBidOfferRecord,
} from "./entities/cheap-bid.entity";
import { CreateCheapBidDto } from "./dto/create-cheap-bid.dto";
import { UpdateCheapBidDto } from "./dto/update-cheap-bid.dto";

const OFFER_COLUMNS = `
  id,
  source,
  originFrom,
  destinationTo,
  airLine,
  travellType,
  cabin,
  departureDate,
  returnDate,
  bidAdtPrice,
  bidChdPrice,
  bidInfPrice,
  currency,
  discountType,
  linkExpiryDate,
  status,
  flightId,
  stops,
  created_at,
  updated_at
`;

const toDate = (val?: string | Date | null) => {
  if (val === undefined) return undefined;
  if (val === null || val === "") return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toMysqlDateTimeString = (val?: string | Date | null): string | null => {
  if (val === undefined || val === null || val === "") return null;
  
  if (val instanceof Date) {
    if (Number.isNaN(val.getTime())) return null;
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const date = String(val.getUTCDate()).padStart(2, '0');
    const h = String(val.getUTCHours()).padStart(2, '0');
    const min = String(val.getUTCMinutes()).padStart(2, '0');
    const s = String(val.getUTCSeconds()).padStart(2, '0');
    return `${y}-${m}-${date} ${h}:${min}:${s}`;
  }

  const str = String(val).trim();
  const match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, y, mo, d, h, mi, s] = match;
    const pad = (n: string | number) => String(n).padStart(2, '0');
    return `${y}-${pad(mo)}-${pad(d)} ${pad(h || 0)}:${pad(mi || 0)}:${pad(s || 0)}`;
  }

  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const date = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = String(d.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${date} ${h}:${min}:${s}`;
};

const emptyToNull = (val?: string | null) => {
  if (val === undefined) return undefined;
  if (val === null || val.trim() === "") return null;
  return val;
};

@Injectable()
export class CheapBidRepository {
  // CheapBidRepository manages CRUD and duplicate detection for cheap bid offers.
  // Note: stops is an exact filter if specified (0, 1, 2, etc.), or null/undefined
  // representing 'any'/'all' stops (which matches all flights of the given airline).
  // Note: airLine cannot be null for imported Excel offers, checked at the service layer.
  private readonly logger = new Logger(CheapBidRepository.name);

  constructor(private readonly db: MysqlClient) {}

  async findAll(page = 1, limit = 20): Promise<{
    data: CheapBidOfferRecord[];
    total: number;
  }> {
    const offset = (page - 1) * limit;
    const countRow = await this.db.queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM tbl_cheap_bid_offer`,
    );
    const rows = await this.db.query<CheapBidOfferRecord>(
      `SELECT ${OFFER_COLUMNS} FROM tbl_cheap_bid_offer
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return { data: rows, total: Number(countRow?.total ?? 0) };
  }

  async findById(id: number): Promise<CheapBidOfferRecord | null> {
    const offer = await this.db.queryOne<CheapBidOfferRecord>(
      `SELECT ${OFFER_COLUMNS} FROM tbl_cheap_bid_offer WHERE id = ?`,
      [id],
    );
    return offer || null;
  }

  async findByToken(bidToken: string): Promise<CheapBidOfferRecord | null> {
    const id = parseInt(bidToken, 10);
    if (isNaN(id)) return null;
    return this.findById(id);
  }

  async findActiveOfferByFlightId(flightId: string): Promise<CheapBidOfferRecord | null> {
    const row = await this.db.queryOne<CheapBidOfferRecord>(
      `SELECT ${OFFER_COLUMNS} FROM tbl_cheap_bid_offer
       WHERE flightId = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [flightId]
    );
    return row || null;
  }

  async findActiveOffersForRoute(
    origins: string[],
    destinations: string[],
    departureDate: string,
  ): Promise<CheapBidOfferRecord[]> {
    if (!origins?.length || !destinations?.length) return [];

    const depDay = departureDate.slice(0, 10);
    const originsPlaceholders = origins.map(() => 'UPPER(?)').join(',');
    const destsPlaceholders = destinations.map(() => 'UPPER(?)').join(',');

    const query = `
       SELECT ${OFFER_COLUMNS}
       FROM tbl_cheap_bid_offer
       WHERE UPPER(originFrom) IN (${originsPlaceholders})
         AND UPPER(destinationTo) IN (${destsPlaceholders})
         AND status = 'active'
         AND ABS(DATEDIFF(departureDate, ?)) <= 1
       ORDER BY created_at DESC
    `;

    const params = [
      ...origins,
      ...destinations,
      depDay
    ];

    const rows = await this.db.query<CheapBidOfferRecord>(query, params);
    return rows;
  }

  async findActiveDeal(
    origin: string,
    destination: string,
  ): Promise<CheapBidOfferRecord | null> {
    const row = await this.db.queryOne<CheapBidOfferRecord>(
      `SELECT ${OFFER_COLUMNS}
       FROM tbl_cheap_bid_offer
       WHERE UPPER(originFrom) = UPPER(?)
         AND UPPER(destinationTo) = UPPER(?)
         AND status = 'active'
         AND (linkExpiryDate IS NULL OR DATE(linkExpiryDate) >= CURDATE())
       ORDER BY bidAdtPrice ASC, created_at DESC
       LIMIT 1`,
      [origin, destination],
    );
    return row || null;
  }

  async findDuplicateOffer(dto: CreateCheapBidDto): Promise<number | null> {
    const depStr = toMysqlDateTimeString(dto.departureDate);
    const retStr = toMysqlDateTimeString(dto.returnDate);

    const row = await this.db.queryOne<{ id: number }>(
      `SELECT id FROM tbl_cheap_bid_offer
       WHERE UPPER(originFrom) = UPPER(?)
         AND UPPER(destinationTo) = UPPER(?)
         AND departureDate = ?
         AND COALESCE(returnDate, '') = COALESCE(?, '')
         AND UPPER(COALESCE(airLine, '')) = UPPER(COALESCE(?, ''))
         AND UPPER(COALESCE(travellType, '')) = UPPER(COALESCE(?, ''))
         AND UPPER(COALESCE(cabin, '')) = UPPER(COALESCE(?, ''))
         AND COALESCE(flightId, '') = COALESCE(?, '')
         AND COALESCE(stops, -1) = COALESCE(?, -1)
         AND status = 'active'
       LIMIT 1`,
      [
        dto.originFrom,
        dto.destinationTo,
        depStr,
        retStr,
        dto.airLine ?? "",
        dto.travellType ?? "",
        dto.cabin ?? "",
        dto.flightId ?? "",
        dto.stops ?? null,
      ],
    );
    return row ? row.id : null;
  }
  async findExactDuplicateOffer(dto: CreateCheapBidDto): Promise<number | null> {
    const depStr = toMysqlDateTimeString(dto.departureDate);
    const retStr = toMysqlDateTimeString(dto.returnDate);

    const row = await this.db.queryOne<{ id: number }>(
      `SELECT id FROM tbl_cheap_bid_offer
       WHERE UPPER(originFrom) = UPPER(?)
         AND UPPER(destinationTo) = UPPER(?)
         AND departureDate = ?
         AND COALESCE(returnDate, '') = COALESCE(?, '')
         AND UPPER(COALESCE(airLine, '')) = UPPER(COALESCE(?, ''))
         AND UPPER(COALESCE(travellType, '')) = UPPER(COALESCE(?, ''))
         AND UPPER(COALESCE(cabin, '')) = UPPER(COALESCE(?, ''))
         AND COALESCE(flightId, '') = COALESCE(?, '')
         AND COALESCE(stops, -1) = COALESCE(?, -1)
         AND ABS(bidAdtPrice - ?) < 0.01
         AND ABS(COALESCE(bidChdPrice, -1) - COALESCE(?, -1)) < 0.01
         AND ABS(COALESCE(bidInfPrice, -1) - COALESCE(?, -1)) < 0.01
         AND COALESCE(discountType, 'replace') = COALESCE(?, 'replace')
         AND status = 'active'
       LIMIT 1`,
      [
        dto.originFrom,
        dto.destinationTo,
        depStr,
        retStr,
        dto.airLine ?? "",
        dto.travellType ?? "",
        dto.cabin ?? "",
        dto.flightId ?? "",
        dto.stops ?? null,
        dto.bidAdtPrice,
        dto.bidChdPrice ?? null,
        dto.bidInfPrice ?? null,
        dto.discountType ?? "replace",
      ],
    );
    return row ? row.id : null;
  }


  async create(dto: CreateCheapBidDto): Promise<number> {
    const existingBidId = await this.findDuplicateOffer(dto);
    if (existingBidId !== null) {
      await this.db.query(
        `UPDATE tbl_cheap_bid_offer SET
          bidAdtPrice = ?, bidChdPrice = ?, bidInfPrice = ?,
          linkExpiryDate = ?, source = ?, flightId = ?, discountType = ?, stops = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          dto.bidAdtPrice,
          dto.bidChdPrice ?? null,
          dto.bidInfPrice ?? null,
          toMysqlDateTimeString(dto.linkExpiryDate) ?? null,
          dto.source ?? null,
          dto.flightId ?? null,
          dto.discountType ?? 'replace',
          dto.stops ?? null,
          existingBidId,
        ],
      );

      return existingBidId;
    }

    const bidId = await this.db.insert(
      `INSERT INTO tbl_cheap_bid_offer (
        source,
        originFrom, destinationTo, airLine, travellType, cabin,
        departureDate, returnDate,
        bidAdtPrice, bidChdPrice, bidInfPrice,
        currency, discountType, linkExpiryDate, status, flightId, stops
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        dto.source ?? null,
        dto.originFrom.toUpperCase(),
        dto.destinationTo.toUpperCase(),
        dto.airLine?.toUpperCase() ?? null,
        dto.travellType ?? null,
        dto.cabin ?? null,
        toMysqlDateTimeString(dto.departureDate) ?? null,
        toMysqlDateTimeString(dto.returnDate) ?? null,
        dto.bidAdtPrice,
        dto.bidChdPrice ?? null,
        dto.bidInfPrice ?? null,
        dto.currency ?? "USD",
        dto.discountType ?? "replace",
        toMysqlDateTimeString(dto.linkExpiryDate) ?? null,
        dto.flightId ?? null,
        dto.stops ?? null,
      ],
    );

    return bidId;
  }

  async update(bidId: number, dto: UpdateCheapBidDto): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    const map: Record<string, unknown> = {
      source: dto.source,
      originFrom: dto.originFrom?.toUpperCase(),
      destinationTo: dto.destinationTo?.toUpperCase(),
      airLine: dto.airLine?.toUpperCase(),
      travellType: dto.travellType,
      cabin: dto.cabin,
      departureDate: toMysqlDateTimeString(dto.departureDate),
      returnDate: toMysqlDateTimeString(dto.returnDate),
      bidAdtPrice: dto.bidAdtPrice,
      bidChdPrice: dto.bidChdPrice,
      bidInfPrice: dto.bidInfPrice,
      currency: dto.currency,
      discountType: dto.discountType,
      linkExpiryDate: toMysqlDateTimeString(dto.linkExpiryDate),
      status: dto.status,
      flightId: dto.flightId,
      stops: dto.stops,
    };

    for (const [key, value] of Object.entries(map)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(bidId);
    await this.db.query(
      `UPDATE tbl_cheap_bid_offer SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
  }

  async delete(bidId: number): Promise<void> {
    await this.db.query(
      `DELETE FROM tbl_cheap_bid_offer WHERE id = ?`,
      [bidId],
    );
  }

  async deleteAll(): Promise<number> {
    const result = await this.db.query<{ affectedRows: number }>(
      `DELETE FROM tbl_cheap_bid_offer`,
    );
    return (result as any)?.affectedRows ?? 0;
  }

  async deleteBulk(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const placeholders = ids.map(() => "?").join(", ");
    const result = await this.db.query<{ affectedRows: number }>(
      `DELETE FROM tbl_cheap_bid_offer WHERE id IN (${placeholders})`,
      ids,
    );
    return (result as any)?.affectedRows ?? 0;
  }

  async getRunningStatus(): Promise<string> {
    try {
      const rows = await this.db.query<{ running_status: string }>(
        `SELECT running_status FROM tbl_cheap_bid_status LIMIT 1`,
      );
      if (rows.length > 0) {
        return rows[0].running_status || "Stop";
      }
      return "Stop";
    } catch (error: any) {
      this.logger.error(`[getRunningStatus] failed: ${error.message}`, error.stack);
      return "Stop";
    }
  }

  async updateRunningStatus(status: string): Promise<void> {
    try {
      const rows = await this.db.query<{ id: number }>(
        `SELECT id FROM tbl_cheap_bid_status LIMIT 1`
      );
      if (rows.length > 0) {
        await this.db.query(
          `UPDATE tbl_cheap_bid_status SET running_status = ? WHERE id = ?`,
          [status, rows[0].id]
        );
      } else {
        await this.db.insert(
          `INSERT INTO tbl_cheap_bid_status (running_status) VALUES (?)`,
          [status]
        );
      }
    } catch (error: any) {
      this.logger.error(`[updateRunningStatus] failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}
