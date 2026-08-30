import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { SpanishJetcostMysqlClient } from "../../database/spanish-jetcost-mysql.client";

export interface HoldDestinationRow {
  hold_des_id: number;
  hold_destination: string | null;
}

export interface HoldOriginRow {
  hold_org_id: number;
  hold_orgin: string | null;
}

export interface ClickDetailRow {
  Id: string;
  log: string;
  CreatedOn: string;
  Ip: string | null;
}

@Injectable()
export class JetcostConfigRepository {
  private readonly logger = new Logger(JetcostConfigRepository.name);

  constructor(private readonly db: SpanishJetcostMysqlClient) {}

  // ─── Hold Destinations (tbl_hold_des_ezee) ─────────────────────────────────
  async findAllHoldDestinations(): Promise<HoldDestinationRow[]> {
    return this.db.query<HoldDestinationRow>(
      "SELECT hold_des_id, hold_destination FROM tbl_hold_des_ezee ORDER BY hold_des_id DESC",
      [],
    );
  }

  async createHoldDestination(destination: string): Promise<number> {
    return this.db.insert(
      "INSERT INTO tbl_hold_des_ezee (hold_destination) VALUES (?)",
      [destination],
    );
  }

  async deleteHoldDestination(id: number): Promise<void> {
    await this.db.query(
      "DELETE FROM tbl_hold_des_ezee WHERE hold_des_id = ?",
      [id],
    );
  }

  // ─── Hold Origins (tbl_hold_org_ezee) ──────────────────────────────────────
  async findAllHoldOrigins(): Promise<HoldOriginRow[]> {
    return this.db.query<HoldOriginRow>(
      "SELECT hold_org_id, hold_orgin FROM tbl_hold_org_ezee ORDER BY hold_org_id DESC",
      [],
    );
  }

  async createHoldOrigin(origin: string): Promise<number> {
    return this.db.insert(
      "INSERT INTO tbl_hold_org_ezee (hold_orgin) VALUES (?)",
      [origin],
    );
  }

  async deleteHoldOrigin(id: number): Promise<void> {
    await this.db.query(
      "DELETE FROM tbl_hold_org_ezee WHERE hold_org_id = ?",
      [id],
    );
  }

  // ─── Click Details (click_detail) ──────────────────────────────────────────
  async findAllClickDetails(
    page = 1,
    limit = 20,
  ): Promise<{ data: ClickDetailRow[]; total: number }> {
    const offset = (page - 1) * limit;

    const countRows = await this.db.query<{ total: number }>(
      "SELECT COUNT(*) as total FROM click_detail",
      [],
    );
    const total = Number(countRows[0]?.total ?? 0);

    const data = await this.db.query<ClickDetailRow>(
      "SELECT Id, log, CreatedOn, Ip FROM click_detail ORDER BY CreatedOn DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );

    return { data, total };
  }

  async createClickDetail(log: unknown, ip: string | null): Promise<string> {
    const id = randomUUID();
    const logText = typeof log === "string" ? log : JSON.stringify(log ?? {});
    await this.db.query(
      "INSERT INTO click_detail (Id, log, Ip) VALUES (?, ?, ?)",
      [id, logText, ip],
    );
    return id;
  }

  async deleteClickDetail(id: string): Promise<void> {
    await this.db.query("DELETE FROM click_detail WHERE Id = ?", [id]);
  }
}
