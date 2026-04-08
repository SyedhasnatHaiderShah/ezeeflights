import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { FinanceService } from './finance.service';

@ApiTags('admin-ops-finance')
@Controller({ path: 'admin/finance', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Get('settlements')
  @AdminPermission('FINANCE_OPS', AdminPermissionAction.READ)
  settlements() {
    return this.service.getSettlements();
  }

  @Get('reconciliation')
  @AdminPermission('FINANCE_OPS', AdminPermissionAction.READ)
  reconciliation() {
    return this.service.getReconciliation();
  }
}
