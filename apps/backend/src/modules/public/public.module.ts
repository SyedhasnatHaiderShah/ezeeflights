import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { PostgresClient } from "../../database/postgres.client";
import { PublicAirlinesController } from "./public-airlines.controller";
import { PublicReviewsController } from "./public-reviews.controller";
import { PublicAirlinesService } from "./public-airlines.service";
import { PublicReviewsService } from "./public-reviews.service";

@Module({
  controllers: [PublicAirlinesController, PublicReviewsController],
  providers: [PostgresClient, PublicAirlinesService, PublicReviewsService],
})
export class PublicModule implements OnModuleInit {
  onModuleInit() {
    Logger.log("PublicModule initialized", "PublicModule");
  }
}
