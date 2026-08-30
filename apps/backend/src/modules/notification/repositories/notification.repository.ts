import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import {
  Notification,
  EmailNotification,
  NotificationBookingType,
  NotificationDeliveryLogEntry,
  NotificationEntity,
  EmailNotificationEntity,
  NotificationLogEntity,
  NotificationQueueEntity,
  NotificationStatus,
  NotificationTemplateEntity,
  NotificationType,
} from '../entities/notification.entity';

export type CreateNotificationMeta = {
  bookingType?: NotificationBookingType | null;
  bookingRef?: string | null;
  bookingId?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  templateName?: string | null;
  travelDate?: Date | null;
};

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(EmailNotification)
    private readonly emailRepo: Repository<EmailNotification>,
  ) {}

  createNotification(
    userId: string,
    type: NotificationType,
    payload: Record<string, unknown>,
    meta: CreateNotificationMeta = {},
  ): Promise<NotificationEntity | EmailNotificationEntity | null> {
    if (type === 'IN_APP') {
      const notification = this.notificationRepo.create({
        userId,
        type,
        payload,
        isRead: false,
      });
      return this.notificationRepo.save(notification);
    } else {
      const emailNotif = this.emailRepo.create({
        recordType: 'MESSAGE',
        userId,
        type,
        status: 'PENDING',
        payload,
        retryCount: 0,
        deliveryLogs: [],
        bookingType: meta.bookingType ?? null,
        bookingRef: meta.bookingRef ?? null,
        bookingId: meta.bookingId ?? null,
        contactEmail: meta.contactEmail ?? null,
        contactPhone: meta.contactPhone ?? null,
        templateName: meta.templateName ?? null,
        travelDate: meta.travelDate ?? null,
      });
      return this.emailRepo.save(emailNotif);
    }
  }

  countByBookingRef(bookingRef: string): Promise<number> {
    return this.emailRepo.countBy({ bookingRef, recordType: 'MESSAGE' });
  }

  async wasReminderSent(
    templateName: string,
    bookingRef: string,
    weekIndex?: number,
  ): Promise<boolean> {
    const qb = this.emailRepo
      .createQueryBuilder('n')
      .where("n.record_type = 'MESSAGE'")
      .andWhere('n.template_name = :templateName', { templateName })
      .andWhere('n.booking_ref = :bookingRef', { bookingRef });

    if (weekIndex !== undefined) {
      qb.andWhere(
        "CAST(JSON_UNQUOTE(JSON_EXTRACT(n.payload, '$.weekIndex')) AS SIGNED) = :weekIndex",
        { weekIndex },
      );
    }

    const count = await qb.getCount();
    return count > 0;
  }

  findById(id: string): Promise<EmailNotificationEntity | null> {
    return this.emailRepo.findOneBy({ id, recordType: 'MESSAGE' });
  }

  async updateStatus(id: string, status: NotificationStatus): Promise<EmailNotificationEntity | null> {
    const notification = await this.emailRepo.findOneBy({ id, recordType: 'MESSAGE' });
    if (!notification) return null;
    notification.status = status;
    if (status === 'SENT') {
      notification.sentAt = new Date();
    }
    return this.emailRepo.save(notification);
  }

  // --- IN-APP UI QUERIES ---

  listByUserId(userId: string, page = 1, limit = 20): Promise<NotificationEntity[]> {
    const offset = (page - 1) * limit;
    return this.notificationRepo.find({
      where: { userId, type: 'IN_APP' },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.countBy({ userId, isRead: false, type: 'IN_APP' });
  }

  async markRead(id: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepo.update(
      { id, userId, type: 'IN_APP' },
      { isRead: true },
    );
    return (result.affected ?? 0) > 0;
  }

  async markAllRead(userId: string): Promise<boolean> {
    const result = await this.notificationRepo.update(
      { userId, isRead: false, type: 'IN_APP' },
      { isRead: true },
    );
    return (result.affected ?? 0) > 0;
  }

  async deleteAll(userId: string): Promise<boolean> {
    const result = await this.notificationRepo.delete({ userId, type: 'IN_APP' });
    return (result.affected ?? 0) > 0;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await this.notificationRepo.delete({ id, userId, type: 'IN_APP' });
    return (result.affected ?? 0) > 0;
  }

  async cleanUpReadNotifications(days = 7): Promise<boolean> {
    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - days);

    const result = await this.notificationRepo.delete({
      type: 'IN_APP',
      isRead: true,
      createdAt: LessThan(cutOffDate),
    });
    return (result.affected ?? 0) > 0;
  }

  // --- OUTBOUND SYSTEM/WORKER LOGS ---

  async createLog(
    notificationId: string,
    status: NotificationStatus,
    response: Record<string, unknown> | null,
    errorMessage: string | null,
  ): Promise<NotificationLogEntity | null> {
    const notification = await this.emailRepo.findOneBy({
      id: notificationId,
      recordType: 'MESSAGE',
    });
    if (!notification) return null;

    const entry: NotificationDeliveryLogEntry = {
      status,
      response,
      errorMessage,
      timestamp: new Date().toISOString(),
    };
    const logs = [...(notification.deliveryLogs ?? []), entry];
    notification.deliveryLogs = logs;
    notification.lastResponse = response;
    notification.lastErrorMessage = errorMessage;
    if (status === 'SENT') {
      notification.sentAt = new Date();
    }
    await this.emailRepo.save(notification);

    return {
      id: `${notificationId}-${logs.length}`,
      notificationId,
      status,
      response,
      errorMessage,
      timestamp: new Date(entry.timestamp),
    };
  }

  async listLogs(limit = 100): Promise<NotificationLogEntity[]> {
    const rows = await this.emailRepo.find({
      where: { recordType: 'MESSAGE' },
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    const flattened: NotificationLogEntity[] = [];
    for (const row of rows) {
      for (const [index, log] of (row.deliveryLogs ?? []).entries()) {
        flattened.push({
          id: `${row.id}-${index + 1}`,
          notificationId: row.id,
          status: log.status,
          response: log.response,
          errorMessage: log.errorMessage,
          timestamp: new Date(log.timestamp),
        });
      }
    }
    return flattened.slice(0, limit);
  }

  // --- TEMPLATES ---

  async createTemplate(template: {
    name: string;
    type: NotificationType;
    subject?: string;
    body: string;
    variables: string[];
  }): Promise<NotificationTemplateEntity | null> {
    let row = await this.emailRepo.findOneBy({
      recordType: 'TEMPLATE',
      templateName: template.name,
      type: template.type,
    });

    if (!row) {
      row = this.emailRepo.create({
        recordType: 'TEMPLATE',
        templateName: template.name,
        type: template.type,
        status: 'SENT',
        payload: {},
        retryCount: 0,
        deliveryLogs: [],
      });
    }

    row.templateSubject = template.subject ?? null;
    row.templateBody = template.body;
    row.templateVariables = template.variables;
    const saved = await this.emailRepo.save(row);

    return this.mapTemplateRow(saved);
  }

  async listTemplates(): Promise<NotificationTemplateEntity[]> {
    const rows = await this.emailRepo.find({
      where: { recordType: 'TEMPLATE' },
      order: { createdAt: 'DESC' },
    });
    return rows.map((row) => this.mapTemplateRow(row));
  }

  async findTemplateByName(
    name: string,
    type: NotificationType,
  ): Promise<{ subject: string | null; body: string; variables: string[] } | null> {
    const row = await this.emailRepo.findOneBy({
      recordType: 'TEMPLATE',
      templateName: name,
      type,
    });
    if (!row) return null;
    return {
      subject: row.templateSubject,
      body: row.templateBody ?? '',
      variables: row.templateVariables ?? [],
    };
  }

  // --- QUEUE ---

  async upsertQueue(
    notificationId: string,
    retryCount: number,
    nextAttemptAt: Date,
  ): Promise<NotificationQueueEntity | null> {
    const notification = await this.emailRepo.findOneBy({
      id: notificationId,
      recordType: 'MESSAGE',
    });
    if (!notification) return null;

    notification.retryCount = retryCount;
    notification.nextAttemptAt = nextAttemptAt;
    const saved = await this.emailRepo.save(notification);
    return {
      notificationId: saved.id,
      retryCount: saved.retryCount,
      nextAttemptAt: saved.nextAttemptAt,
    };
  }

  async clearQueue(notificationId: string): Promise<void> {
    await this.emailRepo.update(
      { id: notificationId, recordType: 'MESSAGE' },
      { nextAttemptAt: null },
    );
  }

  private mapTemplateRow(row: EmailNotification): NotificationTemplateEntity {
    return {
      id: row.id,
      name: row.templateName ?? '',
      type: row.type,
      subject: row.templateSubject,
      body: row.templateBody ?? '',
      variables: row.templateVariables ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
