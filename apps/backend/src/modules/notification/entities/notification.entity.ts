export type NotificationType = 'EMAIL' | 'SMS' | 'WHATSAPP';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface NotificationEntity {
  id: string;
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplateEntity {
  id: string;
  name: string;
  type: NotificationType;
  subject: string | null;
  body: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationLogEntity {
  id: string;
  notificationId: string;
  response: Record<string, unknown> | null;
  status: NotificationStatus;
  errorMessage: string | null;
  timestamp: Date;
}

export interface NotificationQueueEntity {
  id: string;
  notificationId: string;
  retryCount: number;
  nextAttemptAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
