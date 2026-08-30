import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { PriceAlertEntity, PriceAlertType } from "./price-alert.entity";
import * as crypto from "crypto";

@Injectable()
export class PriceAlertService {
  constructor(private readonly dataSource: DataSource) {}

  async create(
    userId: string,
    type: PriceAlertType,
    searchParams: Record<string, unknown>,
    targetPrice: number,
    channels: string[] = ["email"],
  ): Promise<PriceAlertEntity> {
    const id = crypto.randomUUID();
    await this.dataSource.query(
      `INSERT INTO price_alerts (id, user_id, alert_type, search_params, target_price, channels)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        type,
        JSON.stringify(searchParams),
        targetPrice,
        JSON.stringify(channels),
      ],
    );

    const rows = await this.dataSource.query<PriceAlertEntity[]>(
      `SELECT
          id,
          user_id as "userId",
          alert_type as "type",
          search_params as "searchParams",
          target_price as "targetPrice",
          currency,
          channels,
          is_active as "isActive",
          last_checked_at as "lastCheckedAt",
          triggered_at as "triggeredAt",
          created_at as "createdAt"
       FROM price_alerts WHERE id = ?`,
       [id]
    );
    return rows[0];
  }

  async delete(alertId: string, userId: string): Promise<void> {
    await this.dataSource.query(
      "DELETE FROM price_alerts WHERE id = ? AND user_id = ?",
      [alertId, userId],
    );
  }

  listActive(): Promise<PriceAlertEntity[]> {
    return this.dataSource.query<PriceAlertEntity[]>(
      `SELECT
          id,
          user_id as "userId",
          alert_type as "type",
          search_params as "searchParams",
          target_price as "targetPrice",
          currency,
          channels,
          is_active as "isActive",
          last_checked_at as "lastCheckedAt",
          triggered_at as "triggeredAt",
          created_at as "createdAt"
       FROM price_alerts
       WHERE is_active = true`,
    );
  }

  async check(alert: PriceAlertEntity, currentPrice: number): Promise<boolean> {
    const crossed = currentPrice <= alert.targetPrice;
    await this.dataSource.query(
      `UPDATE price_alerts
       SET last_checked_at = NOW(),
           triggered_at = CASE WHEN ? THEN NOW() ELSE triggered_at END,
           is_active = CASE WHEN ? THEN false ELSE is_active END
       WHERE id = ?`,
      [crossed, crossed, alert.id],
    );
    return crossed;
  }

  listUserAlerts(userId: string): Promise<PriceAlertEntity[]> {
    return this.dataSource.query<PriceAlertEntity[]>(
      `SELECT
          id,
          user_id as "userId",
          alert_type as "type",
          search_params as "searchParams",
          target_price as "targetPrice",
          currency,
          channels,
          is_active as "isActive",
          last_checked_at as "lastCheckedAt",
          triggered_at as "triggeredAt",
          created_at as "createdAt"
       FROM price_alerts
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
    );
  }
}
