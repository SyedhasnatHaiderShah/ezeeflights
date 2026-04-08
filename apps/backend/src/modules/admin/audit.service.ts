import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AuditService {
  constructor(private readonly repo: AdminRepository) {}

  async log(userId: string, module: string, action: string, metadata: Record<string, unknown> = {}) {
    await this.repo.insertAuditLog(userId, action, module, metadata);
  }
}
