import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { JetcostConfigService } from "./jetcost-config.service";
import {
  CreateClickDetailDto,
  CreateHoldDestinationDto,
  CreateHoldOriginDto,
} from "./dto/jetcost-config.dto";

const PERMISSION = "FLIGHTS.MARKUP";

@ApiTags("Admin — Hold Destinations")
@Controller({ path: "admin/hold-destinations", version: "1" })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class HoldDestinationController {
  constructor(private readonly service: JetcostConfigService) {}

  @ApiOperation({ summary: "List all held destinations" })
  @ApiResponse({ status: 200, description: "Array of held destinations" })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get()
  findAll() {
    return this.service.listHoldDestinations();
  }

  @ApiOperation({ summary: "Add a held destination" })
  @ApiResponse({ status: 201, description: "Created held destination" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Post()
  create(@Body() dto: CreateHoldDestinationDto) {
    return this.service.createHoldDestination(dto);
  }

  @ApiOperation({ summary: "Delete a held destination" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Deleted" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeHoldDestination(id);
  }
}

@ApiTags("Admin — Hold Origins")
@Controller({ path: "admin/hold-origins", version: "1" })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class HoldOriginController {
  constructor(private readonly service: JetcostConfigService) {}

  @ApiOperation({ summary: "List all held origins" })
  @ApiResponse({ status: 200, description: "Array of held origins" })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get()
  findAll() {
    return this.service.listHoldOrigins();
  }

  @ApiOperation({ summary: "Add a held origin" })
  @ApiResponse({ status: 201, description: "Created held origin" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Post()
  create(@Body() dto: CreateHoldOriginDto) {
    return this.service.createHoldOrigin(dto);
  }

  @ApiOperation({ summary: "Delete a held origin" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Deleted" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.service.removeHoldOrigin(id);
  }
}

@ApiTags("Admin — Click Details")
@Controller({ path: "admin/click-details", version: "1" })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class ClickDetailController {
  constructor(private readonly service: JetcostConfigService) {}

  @ApiOperation({ summary: "List click-detail logs (paginated)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Paginated click logs" })
  @AdminPermission(PERMISSION, AdminPermissionAction.READ)
  @Get()
  findAll(@Query("page") page = 1, @Query("limit") limit = 20) {
    return this.service.listClickDetails(Number(page), Number(limit));
  }

  @ApiOperation({ summary: "Record a click-detail log entry" })
  @ApiResponse({ status: 201, description: "Created log entry" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Post()
  create(@Body() dto: CreateClickDetailDto) {
    return this.service.createClickDetail(dto);
  }

  @ApiOperation({ summary: "Delete a click-detail log entry" })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Deleted" })
  @AdminPermission(PERMISSION, AdminPermissionAction.WRITE)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.service.removeClickDetail(id);
  }
}
