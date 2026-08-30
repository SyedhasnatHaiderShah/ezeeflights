import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
} from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { backendEnvPaths } from "./config/load-env";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppLoggerModule } from "./common/logger/logger.module";
import { AppSentryModule } from "./common/sentry/sentry.module";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { AuthModule } from "./modules/auth/auth.module";
import { FlightModule } from "./modules/flight/flight.module";
import { UserModule } from "./modules/user/user.module";
import { AdminModule } from "./modules/admin/admin.module";
// Disabled modules:
import { BookingModule } from "./modules/booking/booking.module";
import { HotelModule } from "./modules/hotel/hotel.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { AiModule } from "./modules/ai/ai.module";
import { NotificationModule } from "./modules/notification/notification.module";
// import { ProfileModule } from "./modules/profile/profile.module";
// import { TicketingModule } from "./modules/ticketing/ticketing.module";
import { HotelBookingModule } from "./modules/hotel-booking/hotel-booking.module";
// import { BillingModule } from "./modules/billing/billing.module";
// import { BookingManagementModule } from "./modules/booking-management/booking-management.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
// import { AdminOpsModule } from "./modules/admin-ops/admin-ops.module";
import { PackageModule } from "./modules/packages/package.module";
// import { AiItineraryModule } from "./modules/ai-itinerary/ai-itinerary.module";
// import { HybridEngineModule } from "./modules/hybrid-engine/hybrid.module";
// import { PromotionsModule } from "./modules/promotions/promotions.module";
// import { TravelDocumentsModule } from "./modules/travel-documents/travel-documents.module";
// import { DestinationModule } from "./modules/destinations/destination.module";
// import { SupportModule } from "./modules/support/support.module";
// import { InsuranceModule } from "./modules/insurance/insurance.module";
// import { TransfersModule } from "./modules/transfers/transfers.module";
import { CarsModule } from "./modules/cars/cars.module";
// import { SeederModule } from "./common/seeder/seeder.module";
import { PublicModule } from "./modules/public/public.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
// import { InquiriesModule } from "./modules/inquiries/inquiries.module";
// import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { CheapBidModule } from "./modules/cheap-bid/cheap-bid.module";
// import { MigrationRunner } from "./database/migration-runner";
// import { SeederService } from "./common/seeder/seeder.service";
import { MysqlClient } from "./database/mysql.client";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./modules/user/entities/user.entity";
import {
  Notification,
  EmailNotification,
} from "./modules/notification/entities/notification.entity";
import { CrmSchemaBootstrap } from "./database/crm-schema.bootstrap";
import { EventsModule } from "./common/events/events.module";

import { AppController } from "./app.controller";

@Module({
  imports: [
    AppLoggerModule,
    AppSentryModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: backendEnvPaths() }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "mysql",
        host: process.env.MYSQL_SERVER || "127.0.0.1",
        port: parseInt(process.env.MYSQL_PORT || "3306", 10),
        username: process.env.MYSQL_UID || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "worldrix_ezeecrm",
        entities: [User, Notification, EmailNotification],
        synchronize: false, // Disabled to prevent MySQL row size limit errors and manual schema conflicts
      }),
    }),
    ScheduleModule.forRoot(),
    EventsModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    AuthModule,
    FlightModule,
    UserModule,
    AdminModule,
    // Disabled modules below:
    BookingModule,
    HotelModule,
    PaymentModule,
    AiModule,
    NotificationModule,
    // ProfileModule,
    // TicketingModule,
    HotelBookingModule,
    // BillingModule,
    // BookingManagementModule,
    // AnalyticsModule,
    // AdminOpsModule,
    PackageModule,
    // AiItineraryModule,
    // HybridEngineModule,
    // PromotionsModule,
    // TravelDocumentsModule,
    // DestinationModule,
    // SupportModule,
    // InsuranceModule,
    // TransfersModule,
    CarsModule,
    // SeederModule,
    // InquiriesModule,
    PublicModule,
    ReviewsModule,
    // WishlistModule,
    CheapBidModule,
  ],
  controllers: [AppController],
  providers: [
    CrmSchemaBootstrap,
    // MigrationRunner,
    MysqlClient,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    // { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements OnApplicationBootstrap, NestModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    // private readonly migrationRunner: MigrationRunner,
    // private readonly seederService: SeederService,
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }

  async onApplicationBootstrap(): Promise<void> {
    const dbHost = process.env.MYSQL_SERVER || "127.0.0.1";
    const dbName = process.env.MYSQL_DATABASE || "worldrix_ezeecrm";
    const isLocal = dbHost === "127.0.0.1" || dbHost === "localhost";
    this.logger.log(
      `App is connected to CRM database "${dbName}" on ${dbHost} (${isLocal ? "LOCAL" : "LIVE"})`,
    );
    // await this.migrationRunner.run();
    // await this.seederService.seedUsers();
  }
}
