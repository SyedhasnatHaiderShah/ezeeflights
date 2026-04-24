import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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
    return this.service.getRecentSearches(req.user.userId, limit);
  }

  @ApiOperation({ summary: "Save a recent search" })
  @ApiResponse({ status: 201, description: "Search saved" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("searches/recent")
  saveSearch(
    @Req() req: AuthenticatedRequest,
    @Body() body: {
      origin: string;
      destination: string;
      searchType: string;
      searchDate?: string;
      metadata?: any;
    },
  ) {
    return this.service.saveSearch(req.user.userId, body);
  }

  @ApiOperation({ summary: "Delete a recent search" })
  @ApiParam({ name: "id", description: "Search UUID" })
  @ApiResponse({ status: 200, description: "Search deleted" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("searches/recent/:id")
  deleteSearch(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.service.deleteRecentSearch(req.user.userId, id);
  }

  @ApiOperation({ summary: "Clear all recent searches" })
  @ApiResponse({ status: 200, description: "All searches cleared" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("searches/recent")
  clearSearches(@Req() req: AuthenticatedRequest) {
    return this.service.clearRecentSearches(req.user.userId);
  }
}
