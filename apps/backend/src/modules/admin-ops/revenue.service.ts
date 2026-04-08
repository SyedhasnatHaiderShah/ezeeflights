import { Injectable } from '@nestjs/common';
import { AdminOpsRepository } from './admin-ops.repository';

@Injectable()
export class RevenueService {
  constructor(private readonly repo: AdminOpsRepository) {}

  async getOverview(from?: string, to?: string) {
    const [overview, byModule] = await Promise.all([
      this.repo.revenueOverview(from, to),
      this.repo.revenueByModule(from, to),
    ]);

    return { ...(overview ?? {}), byModule };
  }

  getByModule(from?: string, to?: string) {
    return this.repo.revenueByModule(from, to);
  }
}
