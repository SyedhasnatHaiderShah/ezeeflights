import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminService } from "./admin.service";
import {
  AssignRoleDto,
  CreateRoleDto,
  UpdateBookingDto,
  UpdateRoleDto,
  UpdateSettingsDto,
  AdminLoginDto,
  AdminPermissionAction,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from "./dto/admin.dto";
import { AdminPermission, AdminRbacGuard } from "./rbac.middleware";

interface JwtRequest extends Request {
  user: { userId: string };
}

@ApiTags("Admin")
@Controller({ path: "admin", version: "1" })
@UseGuards(ThrottlerGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @ApiOperation({ summary: "Admin login" })
  @ApiResponse({ status: 200, description: "Admin access token" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @Post("login")
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.service.login(dto.email, dto.password, req);
  }

  @ApiOperation({ summary: "Get current admin profile" })
  @ApiResponse({ status: 200, description: "Admin user data" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: JwtRequest) {
    return this.service.me(req.user.userId);
  }

  @ApiOperation({ summary: "List admin roles" })
  @ApiResponse({ status: 200, description: "Array of roles" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("RBAC", AdminPermissionAction.READ)
  @Get("roles")
  roles() {
    return this.service.getRoles();
  }

  @ApiOperation({ summary: "Create admin role" })
  @ApiResponse({ status: 201, description: "Role created" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("RBAC", AdminPermissionAction.WRITE)
  @Post("roles")
  createRole(@Body() dto: CreateRoleDto, @Req() req: JwtRequest) {
    return this.service.createRole(dto, req.user.userId);
  }

  @ApiOperation({ summary: "Update admin role" })
  @ApiParam({ name: "id", description: "Role UUID" })
  @ApiResponse({ status: 200, description: "Role updated" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("RBAC", AdminPermissionAction.CONFIGURE)
  @Patch("roles/:id")
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: JwtRequest,
  ) {
    return this.service.updateRole(id, dto, req.user.userId);
  }

  @ApiOperation({ summary: "Get admin dashboard summary" })
  @ApiResponse({ status: 200, description: "Dashboard metrics" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("DASHBOARD", AdminPermissionAction.READ)
  @Get("dashboard")
  dashboard() {
    return this.service.getDashboard();
  }

  @ApiOperation({ summary: "List all users (admin)" })
  @ApiResponse({ status: 200, description: "Array of users" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("USERS", AdminPermissionAction.READ)
  @Get("users")
  users(
    @Query("limit") limit?: string,
    @Query("page") page?: string,
    @Query("search") search?: string,
  ) {
    let lim = limit ? parseInt(limit, 10) : 10;
    if (isNaN(lim) || lim <= 0) lim = 10;
    let pg = page ? parseInt(page, 10) : 1;
    if (isNaN(pg) || pg <= 0) pg = 1;
    return this.service.getUsers(lim, pg, search);
  }

  @ApiOperation({ summary: "Create new user (admin)" })
  @ApiResponse({ status: 201, description: "User created" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("USERS", AdminPermissionAction.WRITE)
  @Post("users")
  createUser(@Body() dto: CreateAdminUserDto, @Req() req: JwtRequest) {
    return this.service.createUser(dto, req.user.userId);
  }

  @ApiOperation({ summary: "Update user (admin)" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({ status: 200, description: "User updated" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("USERS", AdminPermissionAction.WRITE)
  @Patch("users/:id")
  updateUser(
    @Param("id") id: string,
    @Body() dto: UpdateAdminUserDto,
    @Req() req: JwtRequest,
  ) {
    return this.service.updateUser(id, dto, req.user.userId);
  }

  @ApiOperation({ summary: "Delete user (admin)" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({ status: 200, description: "User deleted" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("USERS", AdminPermissionAction.DELETE)
  @Delete("users/:id")
  deleteUser(@Param("id") id: string, @Req() req: JwtRequest) {
    return this.service.deleteUser(id, req.user.userId);
  }

  @ApiOperation({ summary: "Assign role to user (admin)" })
  @ApiParam({ name: "id", description: "User UUID" })
  @ApiResponse({ status: 200, description: "Role assigned" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("USERS", AdminPermissionAction.WRITE)
  @Patch("users/:id/role")
  assignRole(
    @Param("id") id: string,
    @Body() dto: AssignRoleDto,
    @Req() req: JwtRequest,
  ) {
    return this.service.assignRole(id, dto, req.user.userId);
  }

  @ApiOperation({ summary: "List all bookings (admin)" })
  @ApiResponse({ status: 200, description: "Array of bookings" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("BOOKINGS", AdminPermissionAction.READ)
  @Get("bookings")
  bookings(@Query("limit") limit?: string, @Query("page") page?: string, @Query("tab") tab?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    const pg = page ? parseInt(page, 10) : 1;
    return this.service.getBookings(lim, pg, tab);
  }

  @ApiOperation({ summary: "Update booking (admin)" })
  @ApiParam({ name: "id", description: "Booking UUID" })
  @ApiResponse({ status: 200, description: "Booking updated" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("BOOKINGS", AdminPermissionAction.WRITE)
  @Patch("bookings/:id")
  patchBooking(
    @Param("id") id: string,
    @Body() dto: UpdateBookingDto,
    @Req() req: JwtRequest,
  ) {
    return this.service.updateBooking(id, dto, req.user.userId);
  }

  @ApiOperation({ summary: "List all payments (admin)" })
  @ApiResponse({ status: 200, description: "Array of payments" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PAYMENTS", AdminPermissionAction.READ)
  @Get("payments")
  payments() {
    return this.service.getPayments();
  }

  @ApiOperation({ summary: "List all refunds (admin)" })
  @ApiResponse({ status: 200, description: "Array of refunds" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("PAYMENTS", AdminPermissionAction.READ)
  @Get("refunds")
  refunds() {
    return this.service.getRefunds();
  }

  @ApiOperation({ summary: "Get analytics summary (admin)" })
  @ApiResponse({ status: 200, description: "Analytics data" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("ANALYTICS", AdminPermissionAction.READ)
  @Get("analytics")
  analytics() {
    return this.service.getAnalytics();
  }

  @ApiOperation({ summary: "Get platform settings (admin)" })
  @ApiResponse({ status: 200, description: "Settings object" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("SETTINGS", AdminPermissionAction.READ)
  @Get("settings")
  settings() {
    return this.service.getSettings();
  }

  @ApiOperation({ summary: "Update platform settings (admin)" })
  @ApiResponse({ status: 200, description: "Settings updated" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("SETTINGS", AdminPermissionAction.CONFIGURE)
  @Patch("settings")
  patchSettings(@Body() dto: UpdateSettingsDto, @Req() req: JwtRequest) {
    return this.service.updateSettings(dto, req.user.userId);
  }

  @ApiOperation({ summary: "Get audit logs (admin)" })
  @ApiResponse({ status: 200, description: "Array of audit log entries" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("AUDIT", AdminPermissionAction.READ)
  @Get("audit-logs")
  logs() {
    return this.service.getAuditLogs();
  }

  @ApiOperation({ summary: "Get system alerts (admin)" })
  @ApiResponse({ status: 200, description: "Array of alerts" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("ALERTS", AdminPermissionAction.READ)
  @Get("alerts")
  alerts() {
    return this.service.getAlerts();
  }

  @ApiOperation({ summary: "List CRM users (admin)" })
  @ApiResponse({ status: 200, description: "Array of CRM users" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("USERS", AdminPermissionAction.READ)
  @Get("crm-users")
  crmUsers(@Query("limit") limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.service.getCrmUsers(lim);
  }

  @ApiOperation({ summary: "List CRM bookings (admin)" })
  @ApiResponse({ status: 200, description: "Array of CRM bookings" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission("BOOKINGS", AdminPermissionAction.READ)
  @Get("crm-bookings")
  crmBookings(@Query("limit") limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 10;
    return this.service.getCrmBookings(lim);
  }
}
