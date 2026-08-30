import { Module } from "@nestjs/common";
import {
  CheapBidController,
  CheapBidLegacyController,
} from "./cheap-bid.controller";
import { CheapBidService } from "./cheap-bid.service";
import { CheapBidRepository } from "./cheap-bid.repository";
import { MysqlClient } from "../../database/mysql.client";
import { PublicModule } from "../public/public.module";
import { HybridEngineModule } from "../hybrid-engine/hybrid.module";

@Module({
  imports: [PublicModule, HybridEngineModule],
  controllers: [CheapBidController, CheapBidLegacyController],
  providers: [CheapBidService, CheapBidRepository, MysqlClient],
  exports: [CheapBidService], // Exported for use in FlightService (FlightModule)
})
export class CheapBidModule {}
