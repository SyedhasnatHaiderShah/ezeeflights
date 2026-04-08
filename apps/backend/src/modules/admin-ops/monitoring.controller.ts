import { Controller, Get, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { MonitoringService } from './monitoring.service';

@ApiTags('admin-ops-monitoring')
@Controller({ path: 'admin/monitoring', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly service: MonitoringService) {}

  @Get('live')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  live() {
    return this.service.getLiveSnapshot();
  }

  @Sse('live-stream')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  liveStream(): Observable<MessageEvent> {
    return this.service.streamLive().pipe(map((data) => ({ data })));
  }

  @Get('health')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  health() {
    return this.service.getHealth();
  }
}
