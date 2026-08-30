import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type NotificationType = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';
export type NotificationBookingType = 'FLIGHT' | 'HOTEL' | 'CAR' | 'GENERAL';
export type NotificationRecordType = 'MESSAGE' | 'TEMPLATE';

export type NotificationDeliveryLogEntry = {
  status: NotificationStatus;
  response: Record<string, unknown> | null;
  errorMessage: string | null;
  timestamp: string;
};

@Entity({ database: 'worldrix_ezeecrm', name: 'tbl_notification' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 20, default: 'IN_APP' })
  type: NotificationType;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

@Entity({ database: 'worldrix_ezeecrm', name: 'tbl_email_notification' })
export class EmailNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'record_type', type: 'varchar', length: 20, default: 'MESSAGE' })
  recordType: NotificationRecordType;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string | null;

  @Column({ name: 'booking_type', type: 'varchar', length: 20, nullable: true })
  bookingType: NotificationBookingType | null;

  @Column({ name: 'booking_ref', type: 'varchar', length: 50, nullable: true })
  bookingRef: string | null;

  @Column({ name: 'booking_id', type: 'varchar', length: 50, nullable: true })
  bookingId: string | null;

  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 25, nullable: true })
  contactPhone: string | null;

  @Column({ type: 'varchar', length: 20 })
  type: NotificationType;

  @Column({ name: 'template_name', type: 'varchar', length: 120, nullable: true })
  templateName: string | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: NotificationStatus;

  @Column({ type: 'json' })
  payload: Record<string, unknown>;

  @Column({ name: 'travel_date', type: 'datetime', nullable: true })
  travelDate: Date | null;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'next_attempt_at', type: 'timestamp', nullable: true })
  nextAttemptAt: Date | null;

  @Column({ name: 'delivery_logs', type: 'json', nullable: true })
  deliveryLogs: NotificationDeliveryLogEntry[] | null;

  @Column({ name: 'last_response', type: 'json', nullable: true })
  lastResponse: Record<string, unknown> | null;

  @Column({ name: 'last_error_message', type: 'text', nullable: true })
  lastErrorMessage: string | null;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'template_subject', type: 'varchar', length: 255, nullable: true })
  templateSubject: string | null;

  @Column({ name: 'template_body', type: 'text', nullable: true })
  templateBody: string | null;

  @Column({ name: 'template_variables', type: 'json', nullable: true })
  templateVariables: string[] | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

export type NotificationEntity = Notification;
export type EmailNotificationEntity = EmailNotification;

/** @deprecated Use EmailNotificationEntity with recordType=TEMPLATE */
export type NotificationTemplateEntity = {
  id: string;
  name: string;
  type: NotificationType;
  subject: string | null;
  body: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
};

/** @deprecated Delivery logs are stored on EmailNotification.deliveryLogs */
export type NotificationLogEntity = {
  id: string;
  notificationId: string;
  status: NotificationStatus;
  response: Record<string, unknown> | null;
  errorMessage: string | null;
  timestamp: Date;
};

/** @deprecated Queue state is stored on EmailNotification.retryCount/nextAttemptAt */
export type NotificationQueueEntity = {
  notificationId: string;
  retryCount: number;
  nextAttemptAt: Date | null;
};
