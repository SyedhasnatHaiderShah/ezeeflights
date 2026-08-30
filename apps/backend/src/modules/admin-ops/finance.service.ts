import { Injectable } from '@nestjs/common';
import { AdminOpsRepository } from './admin-ops.repository';
import { AuditService } from '../admin/audit.service';

@Injectable()
export class FinanceService {
  constructor(
    private readonly repo: AdminOpsRepository,
    private readonly audit: AuditService,
  ) {}

  getSettlements() {
    return this.repo.settlements();
  }

  getReconciliation() {
    return this.repo.reconciliationLogs();
  }

  async reconcileTransaction(transactionId: string, status: 'MATCHED' | 'MISMATCH', actorId: string) {
    const row = await this.repo.storeReconciliationLog(transactionId, status);
    await this.audit.log(actorId, 'FINANCE_OPS', 'RECONCILE_TRANSACTION', { status, transactionIdMasked: `***${transactionId.slice(-4)}` });
    return row;
  }
}
