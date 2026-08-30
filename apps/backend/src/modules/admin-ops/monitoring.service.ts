import { Injectable } from '@nestjs/common';
import { map, timer } from 'rxjs';
import { AdminOpsRepository } from './admin-ops.repository';

@Injectable()
export class MonitoringService {
  constructor(private readonly repo: AdminOpsRepository) {}

  async getLiveSnapshot() {
    const [liveBookings, health] = await Promise.all([
      this.repo.liveBookings(40),
      this.repo.systemHealth(),
    ]);

    const paymentFailureCount = (liveBookings as Array<{ status: string }>).filter((booking) => booking.status === 'FAILED').length;

    return {
      timestamp: new Date().toISOString(),
      paymentFailureCount,
      liveBookings,
      health,
    };
  }

  streamLive() {
    return timer(0, 5000).pipe(map(() => this.getLiveSnapshot()));
  }

  getHealth() {
    return this.repo.systemHealth();
  }
}
