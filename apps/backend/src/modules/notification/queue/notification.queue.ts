import { Injectable } from '@nestjs/common';

export interface NotificationQueueJob {
  notificationId: string;
  retryCount: number;
}

@Injectable()
export class NotificationQueue {
  private handler: ((job: NotificationQueueJob) => Promise<void>) | null = null;

  registerHandler(handler: (job: NotificationQueueJob) => Promise<void>): void {
    this.handler = handler;
  }

  async enqueue(notificationId: string, delay = 0, retryCount = 0): Promise<void> {
    if (!this.handler) {
      return;
    }

    setTimeout(() => {
      void this.handler?.({ notificationId, retryCount });
    }, delay);
  }
}
