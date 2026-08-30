import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { FlightInquiryEntity, InquiryStatus } from "../entities/inquiry.entity";
import { CreateInquiryDto } from "../dto/create-inquiry.dto";
import { UpdateInquiryDto } from "../dto/update-inquiry.dto";

type CrmBookingRow = Record<string, unknown>;

@Injectable()
export class InquiryRepository {
  constructor(private readonly dataSource: DataSource) {}

  private resolveInitialStatus(status?: string): InquiryStatus {
    const normalized = (status || "").trim().toUpperCase();
    if (
      normalized === "PENDING" ||
      normalized === "REVIEWED" ||
      normalized === "CONTACTED" ||
      normalized === "CLOSED"
    ) {
      return normalized;
    }
    if (normalized === "CONFIRMED" || normalized === "PENDING_PAYMENT") {
      return "REVIEWED";
    }
    return "CONTACTED";
  }

  private mapWorkStatus(workStatus: unknown): InquiryStatus {
    const value = String(workStatus ?? "pending").toLowerCase();
    if (value === "pending") return "CONTACTED";
    if (value === "reviewed") return "REVIEWED";
    if (value === "closed" || value === "cancelled") return "CLOSED";
    return "CONTACTED";
  }

  private async loadTravelers(customerId: number) {
    const rows: Array<{ fullName: string | null }> = await this.dataSource.query(
      `SELECT fullName FROM tbl_customer WHERE customerId = ? ORDER BY cId`,
      [customerId],
    );
    return rows.map((row) => {
      const parts = String(row.fullName ?? "").trim().split(/\s+/);
      return {
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" ") || "",
      };
    });
  }

  private async mapCrmRow(row: CrmBookingRow): Promise<FlightInquiryEntity> {
    const customerId = Number(row.customerId);
    const travelers = Number.isFinite(customerId)
      ? await this.loadTravelers(customerId)
      : [];

    const createdAt = row.createdAt ?? row.created_at ?? new Date();

    return {
      id: String(row.source_id || row.sourceId || row.customerId),
      userId: row.userId ? String(row.userId) : null,
      flightId: String(row.source_id || row.sourceId || ""),
      origin: row.originFrom ? String(row.originFrom) : null,
      destination: row.destinationTo ? String(row.destinationTo) : null,
      departDate: row.departureDate ? String(row.departureDate) : null,
      tripType: row.travellType ? String(row.travellType) : null,
      cabinClass: row.cabin ? String(row.cabin) : null,
      adults: Number(row.adtQty ?? 1),
      children: Number(row.chdQty ?? 0),
      infants: Number(row.infQty ?? 0),
      flightSnapshot: null,
      travelers,
      contactEmail: row.email ? String(row.email) : null,
      contactPhone: row.phone ? String(row.phone) : null,
      status: this.mapWorkStatus(row.workStatus ?? row.work_status),
      adminNotes: null,
      createdAt: new Date(String(createdAt)),
      updatedAt: new Date(String(createdAt)),
    };
  }

  private crmSelectSql(extraWhere = ""): string {
    return `
      SELECT
        cd.customerId,
        cd.bookingRef,
        cd.originFrom,
        cd.destinationTo,
        cd.travellType,
        cd.cabin,
        cd.departureDate,
        cd.email,
        cd.phone,
        cd.work_status AS workStatus,
        cd.source_id AS source_id,
        cd.created_at AS createdAt,
        MAX(c.adtQty) AS adtQty,
        MAX(c.chdQty) AS chdQty,
        MAX(c.infQty) AS infQty,
        u.id AS userId
      FROM tbl_customerdetails cd
      LEFT JOIN tbl_customer c ON c.customerId = cd.customerId
      LEFT JOIN users u ON LOWER(u.email) = LOWER(cd.email)
      ${extraWhere}
      GROUP BY cd.customerId
    `;
  }

  async create(
    userId: string | null,
    dto: CreateInquiryDto,
  ): Promise<FlightInquiryEntity> {
    const id = randomUUID();
    const now = new Date();
    const initialStatus = this.resolveInitialStatus(dto.status);

    return {
      id,
      userId,
      flightId: dto.flightId,
      origin: dto.origin ?? null,
      destination: dto.destination ?? null,
      departDate: dto.departDate ?? null,
      tripType: dto.tripType ?? null,
      cabinClass: dto.cabinClass ?? null,
      adults: dto.adults ?? 1,
      children: dto.children ?? 0,
      infants: dto.infants ?? 0,
      flightSnapshot: dto.flightSnapshot ?? null,
      travelers: dto.travelers,
      contactEmail: dto.contactEmail ?? null,
      contactPhone: dto.contactPhone ?? null,
      status: initialStatus,
      adminNotes: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  async listAll(
    status?: string,
    limit: number = 50,
    page: number = 1,
  ): Promise<FlightInquiryEntity[]> {
    const offset = (page - 1) * limit;
    const params: unknown[] = [];
    let where = "WHERE cd.source = 'web'";

    if (status) {
      where += " AND LOWER(cd.work_status) = ?";
      params.push(status.toLowerCase());
    }

    const rows: CrmBookingRow[] = await this.dataSource.query(
      `${this.crmSelectSql(where)}
       ORDER BY cd.created_at DESC, cd.customerId DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return Promise.all(rows.map((row) => this.mapCrmRow(row)));
  }

  async findById(id: string): Promise<FlightInquiryEntity | null> {
    const rows: CrmBookingRow[] = await this.dataSource.query(
      `${this.crmSelectSql("WHERE cd.source_id = ? OR CAST(cd.customerId AS CHAR) = ?")}
       LIMIT 1`,
      [id, id],
    );
    if (!rows.length) return null;
    return this.mapCrmRow(rows[0]);
  }

  async listByUser(userId: string): Promise<FlightInquiryEntity[]> {
    const rows: CrmBookingRow[] = await this.dataSource.query(
      `${this.crmSelectSql("WHERE u.id = ?")}
       ORDER BY cd.created_at DESC
       LIMIT 100`,
      [userId],
    );
    return Promise.all(rows.map((row) => this.mapCrmRow(row)));
  }

  async update(
    id: string,
    dto: UpdateInquiryDto,
  ): Promise<FlightInquiryEntity | null> {
    if (dto.status !== undefined) {
      await this.dataSource.query(
        `UPDATE tbl_customerdetails
         SET work_status = ?
         WHERE source_id = ? OR CAST(customerId AS CHAR) = ?`,
        [dto.status.toLowerCase(), id, id],
      );
    }

    return this.findById(id);
  }

  async summaryStats(): Promise<{
    total: string;
    pending: string;
    reviewed: string;
    contacted: string;
    closed: string;
  } | null> {
    const rows: Array<Record<string, string>> = await this.dataSource.query(
      `SELECT
         CAST(COUNT(*) AS CHAR) AS total,
         CAST(SUM(CASE WHEN LOWER(work_status) = 'pending' THEN 1 ELSE 0 END) AS CHAR) AS pending,
         CAST(SUM(CASE WHEN LOWER(work_status) = 'reviewed' THEN 1 ELSE 0 END) AS CHAR) AS reviewed,
         CAST(SUM(CASE WHEN LOWER(work_status) IN ('contacted', 'pending') THEN 1 ELSE 0 END) AS CHAR) AS contacted,
         CAST(SUM(CASE WHEN LOWER(work_status) IN ('closed', 'cancelled') THEN 1 ELSE 0 END) AS CHAR) AS closed
       FROM tbl_customerdetails
       WHERE source = 'web'`,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      total: row.total ?? "0",
      pending: row.pending ?? "0",
      reviewed: row.reviewed ?? "0",
      contacted: row.contacted ?? "0",
      closed: row.closed ?? "0",
    };
  }
}
