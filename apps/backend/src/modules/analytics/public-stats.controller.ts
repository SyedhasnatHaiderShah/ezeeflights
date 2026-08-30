import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Public Stats')
@Controller({ path: 'stats', version: '1' })
export class PublicStatsController {
  @ApiOperation({ summary: 'Get public platform statistics' })
  @ApiResponse({ status: 200, description: 'Stats object' })
  @Get('public')
  getPublicStats() {
    return {
      bookings: 12500,
      users: 8500,
      destinations: 450,
      support: '24/7',
    };
  }
}
