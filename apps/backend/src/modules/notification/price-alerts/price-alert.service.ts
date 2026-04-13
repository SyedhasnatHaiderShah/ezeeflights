import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { PriceAlertEntity, PriceAlertType } from './price-alert.entity';

@Injectable()
export class PriceAlertService {
  constructor(private readonly db: PostgresClient) {}

  create(userId: string, type: PriceAlertType, searchParams: Record<string, unknown>, targetPrice: number, channels: string[] = ['email']) {
    return this.db.queryOne<PriceAlertEntity>(
      `INSERT INTO price_alerts (user_id, alert_type, search_params, target_price, channels)
       VALUES ($1, $2, $3::jsonb, $4, $5::jsonb)
       RETURNING
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
          created_at as "createdAt"`,
      [userId, type, JSON.stringify(searchParams), targetPrice, JSON.stringify(channels)],
    );
  }

  async delete(alertId: string, userId: string): Promise<void> {
    await this.db.query('DELETE FROM price_alerts WHERE id = $1 AND user_id = $2', [alertId, userId]);
  }

  listActive(): Promise<PriceAlertEntity[]> {
    return this.db.query<PriceAlertEntity>(
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
    await this.db.query(
      `UPDATE price_alerts
       SET last_checked_at = NOW(),
           triggered_at = CASE WHEN $2 THEN NOW() ELSE triggered_at END,
           is_active = CASE WHEN $2 THEN false ELSE is_active END
       WHERE id = $1`,
      [alert.id, crossed],
    );
    return crossed;
  }
}
