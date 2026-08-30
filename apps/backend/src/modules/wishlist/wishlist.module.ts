import { Module } from "@nestjs/common";
import { WishlistController } from "./controllers/wishlist.controller";
import { AdminWishlistController } from "./controllers/admin-wishlist.controller";
import { WishlistService } from "./services/wishlist.service";
import { WishlistRepository } from "./repositories/wishlist.repository";
import { MysqlClient } from "../../database/mysql.client";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [AdminModule],
  controllers: [WishlistController, AdminWishlistController],
  providers: [WishlistService, WishlistRepository, MysqlClient],
  exports: [WishlistService],
})
export class WishlistModule {}
