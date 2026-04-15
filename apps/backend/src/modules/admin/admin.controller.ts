import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AssignRoleDto, CreateRoleDto, UpdateBookingDto, UpdateRoleDto, UpdateSettingsDto, AdminLoginDto, AdminPermissionAction } from './dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from './rbac.middleware';

interface JwtRequest extends Request { user: { userId: string }; }

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@UseGuards(ThrottlerGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin access token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.service.login(dto.email, dto.password, req);
  }

  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Admin user data' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: JwtRequest) { return this.service.me(req.user.userId); }

  @ApiOperation({ summary: 'List admin roles' })
  @ApiResponse({ status: 200, description: 'Array of roles' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission('RBAC', AdminPermissionAction.READ)
  @Get('roles')
  roles() { return this.service.getRoles(); }

  @ApiOperation({ summary: 'Create admin role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission('RBAC', AdminPermissionAction.WRITE)
  @Post('roles')
  createRole(@Body() dto: CreateRoleDto, @Req() req: JwtRequest) { return this.service.createRole(dto, req.user.userId); }

  @ApiOperation({ summary: 'Update admin role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission('RBAC', AdminPermissionAction.CONFIGURE)
  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Req() req: JwtRequest) { return this.service.updateRole(id, dto, req.user.userId); }

  @ApiOperation({ summary: 'Get admin dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('DASHBOARD', AdminPermissionAction.READ)
  @Get('dashboard') dashboard() { return this.service.getDashboard(); }

  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiResponse({ status: 200, description: 'Array of users' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('USERS', AdminPermissionAction.READ)
  @Get('users') users() { return this.service.getUsers(); }

  @ApiOperation({ summary: 'Assign role to user (admin)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Role assigned' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('USERS', AdminPermissionAction.WRITE)
  @Patch('users/:id/role') assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto, @Req() req: JwtRequest) { return this.service.assignRole(id, dto, req.user.userId); }

  @ApiOperation({ summary: 'List all bookings (admin)' })
  @ApiResponse({ status: 200, description: 'Array of bookings' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('BOOKINGS', AdminPermissionAction.READ)
  @Get('bookings') bookings() { return this.service.getBookings(); }

  @ApiOperation({ summary: 'Update booking (admin)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking updated' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('BOOKINGS', AdminPermissionAction.WRITE)
  @Patch('bookings/:id') patchBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto, @Req() req: JwtRequest) { return this.service.updateBooking(id, dto, req.user.userId); }

  @ApiOperation({ summary: 'List all payments (admin)' })
  @ApiResponse({ status: 200, description: 'Array of payments' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('PAYMENTS', AdminPermissionAction.READ)
  @Get('payments') payments() { return this.service.getPayments(); }

  @ApiOperation({ summary: 'List all refunds (admin)' })
  @ApiResponse({ status: 200, description: 'Array of refunds' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('PAYMENTS', AdminPermissionAction.READ)
  @Get('refunds') refunds() { return this.service.getRefunds(); }

  @ApiOperation({ summary: 'Get analytics summary (admin)' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('ANALYTICS', AdminPermissionAction.READ)
  @Get('analytics') analytics() { return this.service.getAnalytics(); }

  @ApiOperation({ summary: 'Get platform settings (admin)' })
  @ApiResponse({ status: 200, description: 'Settings object' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('SETTINGS', AdminPermissionAction.READ)
  @Get('settings') settings() { return this.service.getSettings(); }

  @ApiOperation({ summary: 'Update platform settings (admin)' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('SETTINGS', AdminPermissionAction.CONFIGURE)
  @Patch('settings') patchSettings(@Body() dto: UpdateSettingsDto, @Req() req: JwtRequest) { return this.service.updateSettings(dto, req.user.userId); }

  @ApiOperation({ summary: 'Get audit logs (admin)' })
  @ApiResponse({ status: 200, description: 'Array of audit log entries' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('AUDIT', AdminPermissionAction.READ)
  @Get('audit-logs') logs() { return this.service.getAuditLogs(); }

  @ApiOperation({ summary: 'Get system alerts (admin)' })
  @ApiResponse({ status: 200, description: 'Array of alerts' })
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('ALERTS', AdminPermissionAction.READ)
  @Get('alerts') alerts() { return this.service.getAlerts(); }
}
