import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminRbacGuard, AdminPermission } from "../admin/rbac.middleware";
import { AdminPermissionAction } from "../admin/dto/admin.dto";
import { WorldrixCrmService } from "./worldrix-crm.service";

const PERMISSION = "FLIGHTS.MARKUP";

type Row = Record<string, unknown>;

@ApiTags("Admin — Worldrix CRM")
@Controller({ path: "admin/worldrix", version: "1" })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class WorldrixCrmController {
  constructor(private readonly service: WorldrixCrmService) {}

  @ApiOperation({ summary: "Metadata for all Worldrix CRM tables" })
  @ApiResponse({ status: 200, description: "Array of table definitions" })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get("meta")
  meta() {
    return this.service.meta();
  }

  @ApiOperation({
    summary:
      "Get complete booking data across all CRM tables by bookingRef and/or customerId",
  })
  @ApiQuery({ name: "bookingRef", required: false, type: String })
  @ApiQuery({ name: "customerId", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Complete consolidated booking result across all 6 CRM tables",
  })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get("booking-inspector")
  async getCompleteBookingDetails(
    @Query("bookingRef") bookingRef?: string,
    @Query("customerId") customerId?: string,
  ) {
    return this.service.getCompleteBookingDetails({ bookingRef, customerId });
  }

  @ApiOperation({ summary: "Get parsed flight details by customer ID" })
  @ApiParam({ name: "customerId", type: String })
  @ApiResponse({ status: 200, description: "Parsed outbound and inbound flight details" })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get("flight-details/:customerId")
  async getFlightDetails(@Param("customerId") customerId: string) {
    return this.service.getFlightDetails(customerId);
  }

  @ApiOperation({ summary: "List rows of a Worldrix CRM table (paginated)" })
  @ApiParam({ name: "resource", type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Paginated rows" })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get(":resource")
  list(
    @Param("resource") resource: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.service.list(resource, Number(page), Number(limit));
  }

  @ApiOperation({ summary: "Create a row" })
  @ApiParam({ name: "resource", type: String })
  @ApiResponse({ status: 201, description: "Created row" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Post(":resource")
  create(@Param("resource") resource: string, @Body() body: Row) {
    return this.service.create(resource, body);
  }

  @ApiOperation({ summary: "Update a row" })
  @ApiParam({ name: "resource", type: String })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Updated row" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Patch(":resource/:id")
  update(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() body: Row,
  ) {
    return this.service.update(resource, id, body);
  }

  @ApiOperation({ summary: "Delete a row" })
  @ApiParam({ name: "resource", type: String })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Deleted" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Delete(":resource/:id")
  remove(@Param("resource") resource: string, @Param("id") id: string) {
    return this.service.remove(resource, id);
  }
}
