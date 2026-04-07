import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationQueue } from './queue/notification.queue';
import { NotificationService } from './services/notification.service';

@Injectable()
export class NotificationProcessor implements OnModuleInit {
  constructor(
    private readonly queue: NotificationQueue,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit(): void {
    this.queue.registerHandler(async (job) => {
      await this.notificationService.processQueuedNotification(job.notificationId, job.retryCount);
    });
  }
}
