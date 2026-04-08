import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { TrendFilterDto } from './dto/admin-ops.dto';
import { InsightsService } from './insights.service';

@ApiTags('admin-ops-insights')
@Controller({ path: 'admin/insights', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Get('top-destinations')
  @AdminPermission('INSIGHTS', AdminPermissionAction.READ)
  topDestinations(@Query() filter: TrendFilterDto) {
    return this.service.topDestinations(filter.from, filter.to);
  }

  @Get('trends')
  @AdminPermission('INSIGHTS', AdminPermissionAction.READ)
  trends(@Query() filter: TrendFilterDto) {
    return this.service.trends(filter.from, filter.to, filter.granularity);
  }
}
