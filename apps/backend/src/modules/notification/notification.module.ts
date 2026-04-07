import { Module } from '@nestjs/common';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { PostgresClient } from '../../database/postgres.client';
import { UserRepository } from '../user/repositories/user.repository';
import { NotificationQueue } from './queue/notification.queue';
import { TemplateEngineService } from './services/template-engine.service';
import { NotificationProvidersService } from './services/providers.service';
import { NotificationProcessor } from './notification.processor';
import { AdminGuard } from './guards/admin.guard';
import { NotificationEventsListener } from './listeners/notification-events.listener';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    PostgresClient,
    UserRepository,
    NotificationQueue,
    TemplateEngineService,
    NotificationProvidersService,
    NotificationProcessor,
    AdminGuard,
    NotificationEventsListener,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
