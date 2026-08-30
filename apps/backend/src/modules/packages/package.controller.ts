import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AdminPermission, AdminRbacGuard } from "../admin/rbac.middleware";
import { AdminPermissionAction } from "../admin/dto/admin.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CreatePackageBookingDto,
  CreatePackageDto,
  packageQuerySchema,
  UpdatePackageDto,
  UpsertItineraryDto,
} from "./dto/package.dto";
import { PackageBookingService } from "./booking.service";
import { ItineraryService } from "./itinerary.service";
import { PackageService } from "./package.service";

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags("Packages")
@Controller({ path: "", version: "1" })
export class PackageController {
  constructor(
    private readonly service: PackageService,
    private readonly itineraryService: ItineraryService,
    private readonly bookingService: PackageBookingService,
  ) {}

  @ApiOperation({ summary: "Create a travel package (admin)" })
  @ApiResponse({ status: 201, description: "Package created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Post("admin/packages")
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePackageDto) {
    dto.type = "package";
    return this.service.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: "Update a travel package (admin)" })
  @ApiParam({ name: "id", description: "Package UUID" })
  @ApiResponse({ status: 200, description: "Package updated" })
  @ApiResponse({ status: 404, description: "Package not found" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Put("admin/packages/:id")
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    dto.type = "package";
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: "Delete a travel package (admin)" })
  @ApiParam({ name: "id", description: "Package UUID" })
  @ApiResponse({ status: 200, description: "Package deleted" })
  @ApiResponse({ status: 404, description: "Package not found" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Delete("admin/packages/:id")
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    await this.service.delete(id, "package");
    return { success: true };
  }

  @ApiOperation({ summary: "List all packages including drafts (admin)" })
  @ApiResponse({ status: 200, description: "Paginated list of packages" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.READ)
  @Get("admin/packages")
  listAdmin(
    @Req() req: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const parsed = packageQuerySchema.parse(query);
    parsed.type = "package";
    return this.service.list(parsed, true);
  }

  @ApiOperation({ summary: "Create a flight deal (admin)" })
  @ApiResponse({ status: 201, description: "Flight deal created" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Post("admin/flight-deals")
  createFlightDeal(@Req() req: AuthenticatedRequest, @Body() dto: CreatePackageDto) {
    dto.type = "flight_deal";
    return this.service.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: "Update a flight deal (admin)" })
  @ApiResponse({ status: 200, description: "Flight deal updated" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Put("admin/flight-deals/:id")
  updateFlightDeal(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    dto.type = "flight_deal";
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: "Delete a flight deal (admin)" })
  @ApiResponse({ status: 200, description: "Flight deal deleted" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Delete("admin/flight-deals/:id")
  async removeFlightDeal(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    await this.service.delete(id, "flight_deal");
    return { success: true };
  }

  @ApiOperation({ summary: "List all flight deals (admin)" })
  @ApiResponse({ status: 200, description: "Paginated list of flight deals" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.READ)
  @Get("admin/flight-deals")
  listAdminFlightDeals(
    @Req() req: AuthenticatedRequest,
    @Query() query: Record<string, unknown>,
  ) {
    const parsed = packageQuerySchema.parse(query);
    parsed.type = "flight_deal";
    return this.service.list(parsed, true);
  }

  @ApiOperation({ summary: "Add itinerary day to a package (admin)" })
  @ApiParam({ name: "id", description: "Package UUID" })
  @ApiResponse({ status: 201, description: "Itinerary day added" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Post("admin/packages/:id/itinerary")
  addItinerary(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpsertItineraryDto,
  ) {
    return this.itineraryService.create(id, dto);
  }

  @ApiOperation({ summary: "Update itinerary day (admin)" })
  @ApiParam({ name: "id", description: "Itinerary day UUID" })
  @ApiResponse({ status: 200, description: "Itinerary day updated" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Put("admin/itinerary/:id")
  updateItinerary(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: UpsertItineraryDto,
  ) {
    return this.itineraryService.update(id, dto);
  }

  @ApiOperation({ summary: "Delete itinerary day (admin)" })
  @ApiParam({ name: "id", description: "Itinerary day UUID" })
  @ApiResponse({ status: 200, description: "Itinerary day deleted" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PACKAGES", AdminPermissionAction.WRITE)
  @Delete("admin/itinerary/:id")
  async deleteItinerary(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ) {
    await this.itineraryService.delete(id);
    return { success: true };
  }

  @ApiOperation({ summary: "List published packages (public)" })
  @ApiResponse({
    status: 200,
    description: "Paginated list of published packages",
  })
  @Get("packages")
  listUser(@Query() query: Record<string, unknown>) {
    const parsed = packageQuerySchema.parse(query);
    return this.service.list(parsed, false);
  }

  @Get("deals/featured")
  async featuredDeals(@Query("limit") limit?: number) {
    console.log(`[BACKEND] featuredDeals called with limit=${limit}`);
    const { data } = await this.service.list(
      { limit: limit || 8, page: 1, type: "flight_deal" },
      false,
    );
    return data.map((pkg) => ({
      id: pkg.id,
      type: "package",
      title: pkg.title,
      originCity: pkg.originCity,
      destinationCity: pkg.destination,
      airline: pkg.airlineName,
      price: pkg.basePrice,
      originalPrice: Math.round(pkg.basePrice * 1.2),
      savingPercent: 20,
      imageUrl:
        pkg.thumbnailUrl ||
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
      isFlashSale: pkg.isFlashSale,
      expiresAt: pkg.expiresAt,
    }));
  }

  @ApiOperation({ summary: "Get package by slug (public)" })
  @ApiParam({ name: "slug", description: "Package URL slug" })
  @ApiResponse({ status: 200, description: "Package details with itinerary" })
  @ApiResponse({ status: 404, description: "Package not found" })
  @Get("packages/:slug")
  getBySlug(@Param("slug") slug: string) {
    return this.service.getBySlug(slug);
  }

  @ApiOperation({ summary: "Book a package" })
  @ApiParam({ name: "id", description: "Package UUID" })
  @ApiResponse({ status: 201, description: "Package booking created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("packages/:id/book")
  book(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: CreatePackageBookingDto,
  ) {
    return this.bookingService.book(req.user.userId, id, dto);
  }

  private ensureAdmin(req: AuthenticatedRequest) {
    if (!(req.user.roles ?? []).includes("admin")) {
      throw new BadRequestException("Admin access required");
    }
  }
}
