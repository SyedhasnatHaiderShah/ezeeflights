import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { FinanceService } from './finance.service';

@ApiTags('Admin Ops')
@Controller({ path: 'admin/finance', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @ApiOperation({ summary: 'Get payment settlements (admin)' })
  @ApiResponse({ status: 200, description: 'Settlement records' })
  @Get('settlements')
  @AdminPermission('FINANCE_OPS', AdminPermissionAction.READ)
  settlements() {
    return this.service.getSettlements();
  }

  @ApiOperation({ summary: 'Get payment reconciliation report (admin)' })
  @ApiResponse({ status: 200, description: 'Reconciliation data' })
  @Get('reconciliation')
  @AdminPermission('FINANCE_OPS', AdminPermissionAction.READ)
  reconciliation() {
    return this.service.getReconciliation();
  }
}
