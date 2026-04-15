import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { DateFilterDto } from './dto/admin-ops.dto';
import { RevenueService } from './revenue.service';

@ApiTags('Admin Ops')
@Controller({ path: 'admin/revenue', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class RevenueController {
  constructor(private readonly service: RevenueService) {}

  @ApiOperation({ summary: 'Get revenue overview (admin)' })
  @ApiResponse({ status: 200, description: 'Revenue overview data' })
  @Get('overview')
  @AdminPermission('FINANCE_OPS', AdminPermissionAction.READ)
  overview(@Query() filter: DateFilterDto) {
    return this.service.getOverview(filter.from, filter.to);
  }

  @ApiOperation({ summary: 'Get revenue breakdown by module (admin)' })
  @ApiResponse({ status: 200, description: 'Revenue by module (flights, hotels, etc.)' })
  @Get('by-module')
  @AdminPermission('FINANCE_OPS', AdminPermissionAction.READ)
  byModule(@Query() filter: DateFilterDto) {
    return this.service.getByModule(filter.from, filter.to);
  }
}
