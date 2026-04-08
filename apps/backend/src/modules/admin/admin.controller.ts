import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AssignRoleDto, CreateRoleDto, UpdateBookingDto, UpdateRoleDto, UpdateSettingsDto, AdminLoginDto, AdminPermissionAction } from './dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from './rbac.middleware';

interface JwtRequest extends Request { user: { userId: string }; }

@ApiTags('admin')
@Controller({ path: 'admin', version: '1' })
@UseGuards(ThrottlerGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.service.login(dto.email, dto.password, req);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: JwtRequest) { return this.service.me(req.user.userId); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission('RBAC', AdminPermissionAction.READ)
  @Get('roles')
  roles() { return this.service.getRoles(); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission('RBAC', AdminPermissionAction.WRITE)
  @Post('roles')
  createRole(@Body() dto: CreateRoleDto, @Req() req: JwtRequest) { return this.service.createRole(dto, req.user.userId); }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminRbacGuard)
  @AdminPermission('RBAC', AdminPermissionAction.CONFIGURE)
  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Req() req: JwtRequest) { return this.service.updateRole(id, dto, req.user.userId); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('DASHBOARD', AdminPermissionAction.READ)
  @Get('dashboard') dashboard() { return this.service.getDashboard(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('USERS', AdminPermissionAction.READ)
  @Get('users') users() { return this.service.getUsers(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('USERS', AdminPermissionAction.WRITE)
  @Patch('users/:id/role') assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto, @Req() req: JwtRequest) { return this.service.assignRole(id, dto, req.user.userId); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('BOOKINGS', AdminPermissionAction.READ)
  @Get('bookings') bookings() { return this.service.getBookings(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('BOOKINGS', AdminPermissionAction.WRITE)
  @Patch('bookings/:id') patchBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto, @Req() req: JwtRequest) { return this.service.updateBooking(id, dto, req.user.userId); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('PAYMENTS', AdminPermissionAction.READ)
  @Get('payments') payments() { return this.service.getPayments(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('PAYMENTS', AdminPermissionAction.READ)
  @Get('refunds') refunds() { return this.service.getRefunds(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('ANALYTICS', AdminPermissionAction.READ)
  @Get('analytics') analytics() { return this.service.getAnalytics(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('SETTINGS', AdminPermissionAction.READ)
  @Get('settings') settings() { return this.service.getSettings(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('SETTINGS', AdminPermissionAction.CONFIGURE)
  @Patch('settings') patchSettings(@Body() dto: UpdateSettingsDto, @Req() req: JwtRequest) { return this.service.updateSettings(dto, req.user.userId); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('AUDIT', AdminPermissionAction.READ)
  @Get('audit-logs') logs() { return this.service.getAuditLogs(); }

  @ApiBearerAuth() @UseGuards(JwtAuthGuard, AdminRbacGuard) @AdminPermission('ALERTS', AdminPermissionAction.READ)
  @Get('alerts') alerts() { return this.service.getAlerts(); }
}
