import { MiddlewareConsumer, Module, NestModule, OnApplicationBootstrap } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppLoggerModule } from './common/logger/logger.module';
import { AppSentryModule } from './common/sentry/sentry.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthModule } from './modules/auth/auth.module';
import { FlightModule } from './modules/flight/flight.module';
import { UserModule } from './modules/user/user.module';
import { BookingModule } from './modules/booking/booking.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationModule } from './modules/notification/notification.module';
import { EventsModule } from './common/events/events.module';
import { ProfileModule } from './modules/profile/profile.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { TicketingModule } from './modules/ticketing/ticketing.module';
import { HotelBookingModule } from './modules/hotel-booking/hotel-booking.module';
import { BillingModule } from './modules/billing/billing.module';
import { BookingManagementModule } from './modules/booking-management/booking-management.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { AdminOpsModule } from './modules/admin-ops/admin-ops.module';
import { PackageModule } from './modules/packages/package.module';
import { AiItineraryModule } from './modules/ai-itinerary/ai-itinerary.module';
import { HybridEngineModule } from './modules/hybrid-engine/hybrid.module';
import { DestinationModule } from './modules/destinations/destination.module';
import { SupportModule } from './modules/support/support.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { CarsModule } from './modules/cars/cars.module';
import { SeederModule } from './common/seeder/seeder.module';
import { PublicModule } from './modules/public/public.module';
import { MigrationRunner } from './database/migration-runner';
import { SeederService } from './common/seeder/seeder.service';
import { PostgresClient } from './database/postgres.client';

@Module({
  imports: [
    AppLoggerModule,
    AppSentryModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EventsModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    AuthModule,
    FlightModule,
    UserModule,
    BookingModule,
    HotelModule,
    PaymentModule,
    AiModule,
    NotificationModule,
    ProfileModule,
    LoyaltyModule,
    TicketingModule,
    HotelBookingModule,
    BillingModule,
    BookingManagementModule,
    AnalyticsModule,
    AdminModule,
    AdminOpsModule,
    PackageModule,
    AiItineraryModule,
    HybridEngineModule,
    DestinationModule,
    SupportModule,
    InsuranceModule,
    TransfersModule,
    CarsModule,
    SeederModule,
    PublicModule,
  ],
  providers: [
    MigrationRunner,
    PostgresClient,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements OnApplicationBootstrap, NestModule {
  constructor(
    private readonly migrationRunner: MigrationRunner,
    private readonly seederService: SeederService,
  ) {}

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.migrationRunner.run();
    await this.seederService.seedUsers();
  }
}
