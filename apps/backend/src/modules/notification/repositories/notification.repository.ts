import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import {
  NotificationEntity,
  NotificationLogEntity,
  NotificationQueueEntity,
  NotificationStatus,
  NotificationTemplateEntity,
  NotificationType,
} from '../entities/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(private readonly db: PostgresClient) {}

  createNotification(userId: string, type: NotificationType, payload: Record<string, unknown>): Promise<NotificationEntity | null> {
    return this.db.queryOne<NotificationEntity>(
      `INSERT INTO notifications (user_id, type, status, payload)
       VALUES ($1, $2, 'PENDING', $3::jsonb)
       RETURNING id, user_id as "userId", type, status, payload, created_at as "createdAt", updated_at as "updatedAt"`,
      [userId, type, JSON.stringify(payload)],
    );
  }

  findById(id: string): Promise<NotificationEntity | null> {
    return this.db.queryOne<NotificationEntity>(
      `SELECT id, user_id as "userId", type, status, payload, created_at as "createdAt", updated_at as "updatedAt"
       FROM notifications WHERE id = $1 LIMIT 1`,
      [id],
    );
  }

  updateStatus(id: string, status: NotificationStatus): Promise<NotificationEntity | null> {
    return this.db.queryOne<NotificationEntity>(
      `UPDATE notifications SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, user_id as "userId", type, status, payload, created_at as "createdAt", updated_at as "updatedAt"`,
      [id, status],
    );
  }

  createLog(notificationId: string, status: NotificationStatus, response: Record<string, unknown> | null, errorMessage: string | null): Promise<NotificationLogEntity | null> {
    return this.db.queryOne<NotificationLogEntity>(
      `INSERT INTO notification_logs (notification_id, response, status, error_message)
       VALUES ($1, $2::jsonb, $3, $4)
       RETURNING id, notification_id as "notificationId", response, status, error_message as "errorMessage", timestamp`,
      [notificationId, response ? JSON.stringify(response) : null, status, errorMessage],
    );
  }

  listLogs(limit = 100): Promise<NotificationLogEntity[]> {
    return this.db.query<NotificationLogEntity>(
      `SELECT id, notification_id as "notificationId", response, status, error_message as "errorMessage", timestamp
       FROM notification_logs ORDER BY timestamp DESC LIMIT $1`,
      [limit],
    );
  }

  createTemplate(template: {
    name: string;
    type: NotificationType;
    subject?: string;
    body: string;
    variables: string[];
  }): Promise<NotificationTemplateEntity | null> {
    return this.db.queryOne<NotificationTemplateEntity>(
      `INSERT INTO notification_templates (name, type, subject, body, variables)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (name, type) DO UPDATE SET
        subject = EXCLUDED.subject,
        body = EXCLUDED.body,
        variables = EXCLUDED.variables,
        updated_at = NOW()
       RETURNING id, name, type, subject, body, variables, created_at as "createdAt", updated_at as "updatedAt"`,
      [template.name, template.type, template.subject ?? null, template.body, JSON.stringify(template.variables)],
    );
  }

  listTemplates(): Promise<NotificationTemplateEntity[]> {
    return this.db.query<NotificationTemplateEntity>(
      `SELECT id, name, type, subject, body, variables, created_at as "createdAt", updated_at as "updatedAt"
       FROM notification_templates ORDER BY created_at DESC`,
    );
  }

  findTemplateByName(name: string, type: NotificationType): Promise<NotificationTemplateEntity | null> {
    return this.db.queryOne<NotificationTemplateEntity>(
      `SELECT id, name, type, subject, body, variables, created_at as "createdAt", updated_at as "updatedAt"
       FROM notification_templates WHERE name = $1 AND type = $2 LIMIT 1`,
      [name, type],
    );
  }

  upsertQueue(notificationId: string, retryCount: number, nextAttemptAt: Date): Promise<NotificationQueueEntity | null> {
    return this.db.queryOne<NotificationQueueEntity>(
      `INSERT INTO notification_queue (notification_id, retry_count, next_attempt_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (notification_id)
       DO UPDATE SET retry_count = EXCLUDED.retry_count, next_attempt_at = EXCLUDED.next_attempt_at, updated_at = NOW()
       RETURNING id, notification_id as "notificationId", retry_count as "retryCount", next_attempt_at as "nextAttemptAt", created_at as "createdAt", updated_at as "updatedAt"`,
      [notificationId, retryCount, nextAttemptAt],
    );
  }

  clearQueue(notificationId: string): Promise<void> {
    return this.db.query(`DELETE FROM notification_queue WHERE notification_id = $1`, [notificationId]).then(() => undefined);
  }
}
