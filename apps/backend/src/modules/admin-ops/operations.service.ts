import { Injectable } from '@nestjs/common';
import { AdminOpsRepository } from './admin-ops.repository';

@Injectable()
export class OperationsService {
  constructor(private readonly repo: AdminOpsRepository) {}

  getStatus(from?: string, to?: string) {
    return this.repo.operationsStatus(from, to);
  }

  getSla(from?: string, to?: string) {
    return this.repo.operationsSla(from, to);
  }
}
