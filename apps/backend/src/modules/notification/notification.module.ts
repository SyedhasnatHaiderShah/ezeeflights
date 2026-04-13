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
import { BookingTriggers } from './triggers/booking.triggers';
import { PaymentTriggers } from './triggers/payment.triggers';
import { FlightTriggers } from './triggers/flight.triggers';
import { PriceAlertTriggers } from './triggers/price-alert.triggers';
import { PriceAlertService } from './price-alerts/price-alert.service';
import { PriceAlertCron } from './price-alerts/price-alert.cron';

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
    BookingTriggers,
    PaymentTriggers,
    FlightTriggers,
    PriceAlertTriggers,
    PriceAlertService,
    PriceAlertCron,
  ],
  exports: [NotificationService, BookingTriggers, PaymentTriggers, FlightTriggers, PriceAlertService],
})
export class NotificationModule {}
