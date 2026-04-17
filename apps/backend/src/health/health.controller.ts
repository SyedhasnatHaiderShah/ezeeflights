import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async health() {
    const checks = await this.healthService.checkDependencies();
    return { status: 'ok', checks };
  }

  @Get('ready')
  async ready() {
    const checks = await this.healthService.checkDependencies();
    if (checks.database === 'down' || checks.redis === 'down') {
      throw new ServiceUnavailableException({ status: 'not_ready', checks });
    }
    return { status: 'ready', checks };
  }

  @Get('live')
  live() {
    return { status: 'live' };
  }
}
