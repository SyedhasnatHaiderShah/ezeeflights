import { Controller, Get, MessageEvent, Sse, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { map, Observable } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminPermissionAction } from '../admin/dto/admin.dto';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { MonitoringService } from './monitoring.service';

@ApiTags('Admin Ops')
@Controller({ path: 'admin/monitoring', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly service: MonitoringService) {}

  @ApiOperation({ summary: 'Get live system snapshot (admin)' })
  @ApiResponse({ status: 200, description: 'Current system metrics' })
  @Get('live')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  live() {
    return this.service.getLiveSnapshot();
  }

  @ApiOperation({ summary: 'SSE stream of live system metrics (admin)' })
  @ApiResponse({ status: 200, description: 'Server-sent events stream' })
  @Sse('live-stream')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  liveStream(): Observable<MessageEvent> {
    return this.service.streamLive().pipe(map((data) => ({ data })));
  }

  @ApiOperation({ summary: 'Get system health status (admin)' })
  @ApiResponse({ status: 200, description: 'Health check data' })
  @Get('health')
  @AdminPermission('OPERATIONS', AdminPermissionAction.READ)
  health() {
    return this.service.getHealth();
  }
}
