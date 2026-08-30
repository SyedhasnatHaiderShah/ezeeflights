import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { notificationFactoryProvider } from '../../common/providers';
import { NotificationController } from './controllers/notification.controller';
import { NotificationService } from './services/notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationQueue } from './queue/notification.queue';
import { TemplateEngineService } from './services/template-engine.service';
import { NotificationProvidersService } from './services/providers.service';
import { ReminderService } from './services/reminder.service';
import { NotificationProcessor } from './notification.processor';
import { AdminGuard } from './guards/admin.guard';
import { NotificationEventsListener } from './listeners/notification-events.listener';
import { BookingTriggers } from './triggers/booking.triggers';
import { PaymentTriggers } from './triggers/payment.triggers';
import { FlightTriggers } from './triggers/flight.triggers';
import { PriceAlertTriggers } from './triggers/price-alert.triggers';
import { PriceAlertService } from './price-alerts/price-alert.service';
import { PriceAlertCron } from './price-alerts/price-alert.cron';
import { Notification, EmailNotification } from './entities/notification.entity';
import { UserModule } from '../user/user.module';
import { forwardRef } from '@nestjs/common';
import { PublicModule } from '../public/public.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, EmailNotification]),
    forwardRef(() => UserModule),
    PublicModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationQueue,
    TemplateEngineService,
    NotificationProvidersService,
    notificationFactoryProvider,
    NotificationProcessor,
    ReminderService,
    AdminGuard,
    NotificationEventsListener,
    BookingTriggers,
    PaymentTriggers,
    FlightTriggers,
    PriceAlertTriggers,
    PriceAlertService,
    PriceAlertCron,
  ],
  exports: [NotificationService, ReminderService, BookingTriggers, PaymentTriggers, FlightTriggers, PriceAlertService],
})
export class NotificationModule {}

