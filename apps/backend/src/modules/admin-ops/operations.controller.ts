import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { DateFilterDto } from './dto/admin-ops.dto';
import { OperationsService } from './operations.service';

@ApiTags('admin-ops-operations')
@Controller({ path: 'admin/operations', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class OperationsController {
  constructor(private readonly service: OperationsService) {}

  @Get('status')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  status(@Query() filter: DateFilterDto) {
    return this.service.getStatus(filter.from, filter.to);
  }

  @Get('sla')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  sla(@Query() filter: DateFilterDto) {
    return this.service.getSla(filter.from, filter.to);
  }
}
