import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UserService } from "../services/user.service";

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags("User")
@Controller({ path: "user", version: "1" })
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({ summary: "Get own user profile" })
  @ApiResponse({ status: 200, description: "User profile data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  profile(@Req() req: AuthenticatedRequest) {
    return this.service.getProfile(req.user.userId);
  }

  @ApiOperation({ summary: "Get recent searches" })
  @ApiResponse({ status: 200, description: "Array of recent searches" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("searches/recent")
  recentSearches(
    @Req() req: AuthenticatedRequest,
    @Query("limit") limit?: number,
  ) {
    // Mock for now
    return [];
  }
}
