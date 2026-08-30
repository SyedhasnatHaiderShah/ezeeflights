import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
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

@ApiTags("Wishlist")
@Controller({ path: "wishlists", version: "1" })
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @ApiOperation({ summary: "Toggle wishlist item (add or remove)" })
  @Post("toggle")
  async toggle(
    @Body()
    body: {
      sessionId?: string;
      userId?: string;
      entityType: string;
      entityId: string;
      data?: any;
    },
  ) {
    return this.service.toggleWishlist({
      userId: body.userId,
      sessionId: body.sessionId,
      entityType: body.entityType,
      entityId: body.entityId,
      data: body.data,
    });
  }

  @ApiOperation({ summary: "Get wishlist for a user or session" })
  @Get()
  async get(
    @Query("sessionId") sessionId?: string,
    @Query("userId") userId?: string,
  ) {
    return this.service.getWishlist({ sessionId, userId });
  }
}
