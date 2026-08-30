import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { FlightSchemaBootstrap } from "./flight-schema.bootstrap";
import { IntegrationsModule } from "../integrations/integrations.module";
import { PublicModule } from "../public/public.module";
import { AdminModule } from "../admin/admin.module";
import { NotificationModule } from "../notification/notification.module";
import { UserModule } from "../user/user.module";
import { FlightController } from "./controllers/flight.controller";
import { FlightAdsController } from "./controllers/flight-ads.controller";
import { AdminFlightAdsController } from "./controllers/admin-flight-ads.controller";
import { DebugController } from "./controllers/debug.controller";
import { FlightService } from "./services/flight.service";
import { FlightAdsService } from "./services/flight-ads.service";
import { TravelportBookingService } from "./services/travelport-booking.service";
import { ExternalFlightProvider, JetcostProvider } from "../../common/providers";
import { FlightRepository } from "./repositories/flight.repository";
import { AdClickRepository } from "./repositories/ad-click.repository";
import { MysqlClient } from "../../database/mysql.client";
import { SpanishJetcostMysqlClient } from "../../database/spanish-jetcost-mysql.client";
import { SeatMapService } from "./seat-map.service";
import { SeatMapRepository } from "./repositories/seat-map.repository";
import { AncillariesService } from "./ancillaries.service";
import { AncillariesRepository } from "./repositories/ancillaries.repository";
import { AffiliateUrlBuilder } from "./utils/affiliate-url.builder";
import { FlightSearchQueryMiddleware } from "./middlewares/flight-search-query.middleware";
import { FlightCrmBookingService } from "./services/flight-crm-booking.service";
import { FlightBookingPaymentService } from "./services/flight-booking-payment.service";
import { FlightBookingPaymentRepository } from "./repositories/flight-booking-payment.repository";
import { HybridEngineModule } from "../hybrid-engine/hybrid.module";
import { UsaMarkupModule } from "../usa-markup/usa-markup.module";
import { CheapBidModule } from "../cheap-bid/cheap-bid.module";

@Module({
  imports: [IntegrationsModule, PublicModule, AdminModule, NotificationModule, UserModule, HybridEngineModule, UsaMarkupModule, CheapBidModule],
  controllers: [
    DebugController,
    FlightAdsController,
    AdminFlightAdsController,
    FlightController,
  ],
  providers: [
    FlightService,
    FlightAdsService,
    TravelportBookingService,
    FlightRepository,
    AdClickRepository,
    SeatMapService,
    SeatMapRepository,
    AncillariesService,
    AncillariesRepository,
    MysqlClient,
    SpanishJetcostMysqlClient,
    FlightSchemaBootstrap,
    AffiliateUrlBuilder,
    ExternalFlightProvider,
    JetcostProvider,
    FlightCrmBookingService,
    FlightBookingPaymentService,
    FlightBookingPaymentRepository,
  ],
  exports: [
    FlightService,
    TravelportBookingService,
    FlightAdsService,
    AdClickRepository,
    ExternalFlightProvider,
    JetcostProvider,
  ],
})
export class FlightModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FlightSearchQueryMiddleware)
      .forRoutes(FlightController, FlightAdsController);
  }
}
