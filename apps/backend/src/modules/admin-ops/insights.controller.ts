import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { TrendFilterDto } from './dto/admin-ops.dto';
import { InsightsService } from './insights.service';

@ApiTags('Admin Ops')
@Controller({ path: 'admin/insights', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @ApiOperation({ summary: 'Get top booking destinations (admin)' })
  @ApiResponse({ status: 200, description: 'Top destinations data' })
  @Get('top-destinations')
  @AdminPermission('INSIGHTS', AdminPermissionAction.READ)
  topDestinations(@Query() filter: TrendFilterDto) {
    return this.service.topDestinations(filter.from, filter.to);
  }

  @ApiOperation({ summary: 'Get booking and revenue trends (admin)' })
  @ApiResponse({ status: 200, description: 'Trend data with granularity' })
  @Get('trends')
  @AdminPermission('INSIGHTS', AdminPermissionAction.READ)
  trends(@Query() filter: TrendFilterDto) {
    return this.service.trends(filter.from, filter.to, filter.granularity);
  }
}
