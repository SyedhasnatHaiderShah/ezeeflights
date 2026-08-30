import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { WishlistService } from "../services/wishlist.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { AdminPermission, AdminRbacGuard } from "../../admin/rbac.middleware";
import { AdminPermissionAction } from "../../admin/dto/admin.dto";

@ApiTags("Admin Wishlist")
@Controller({ path: "admin/wishlists", version: "1" })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class AdminWishlistController {
  constructor(private readonly service: WishlistService) {}

  @ApiOperation({ summary: "Get all wishlists (admin only)" })
  @ApiResponse({
    status: 200,
    description: "List of all saved items across users",
  })
  @Get("all")
  @AdminPermission("ANALYTICS", AdminPermissionAction.READ)
  async adminList(
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    const l = parseInt(limit || "10", 10);
    const p = parseInt(page || "1", 10);
    return this.service.getAllForAdmin({ limit: l, page: p });
  }
}
