import { Module } from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import { ReviewsController } from "./reviews.controller";
import { ReviewsRepository } from "./reviews.repository";
import { ReviewsService } from "./reviews.service";

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, MysqlClient],
  exports: [ReviewsService],
})
export class ReviewsModule {}
