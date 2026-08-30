import { Module } from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import { IntegrationsModule } from "../integrations/integrations.module";
import { HybridEngineModule } from "../hybrid-engine/hybrid.module";
import { PublicModule } from "../public/public.module";
import { NotificationModule } from "../notification/notification.module";
import { HotelController } from "./controllers/hotel.controller";
import { HotelRepository } from "./repositories/hotel.repository";
import { HotelService } from "./services/hotel.service";

@Module({
  imports: [IntegrationsModule, HybridEngineModule, PublicModule, NotificationModule],
  controllers: [HotelController],
  providers: [HotelService, HotelRepository, MysqlClient],
  exports: [HotelService, HotelRepository],
})
export class HotelModule {}
