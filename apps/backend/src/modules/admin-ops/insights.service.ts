import { Injectable } from '@nestjs/common';
import { AdminOpsRepository } from './admin-ops.repository';

@Injectable()
export class InsightsService {
  constructor(private readonly repo: AdminOpsRepository) {}

  async topDestinations(from?: string, to?: string) {
    const type = `top-destinations:${from ?? 'all'}:${to ?? 'all'}`;
    const cached = await this.repo.getInsight(type);
    if (cached) return cached.data;

    const data = { destinations: await this.repo.topDestinations(from, to) };
    await this.repo.upsertInsight(type, data);
    return data;
  }

  async trends(from?: string, to?: string, granularity: 'hour' | 'day' | 'week' = 'day') {
    const type = `trends:${granularity}:${from ?? 'all'}:${to ?? 'all'}`;
    const cached = await this.repo.getInsight(type);
    if (cached) return cached.data;

    const data = { series: await this.repo.trendData(from, to, granularity) };
    await this.repo.upsertInsight(type, data);
    return data;
  }
}
