import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @ApiOperation({ summary: 'Get revenue analytics by time range' })
  @ApiQuery({ name: 'range', enum: ['daily', 'weekly', 'monthly'], description: 'Aggregation period' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date ISO string' })
  @ApiQuery({ name: 'to', required: false, description: 'End date ISO string' })
  @ApiResponse({ status: 200, description: 'Revenue data' })
  @Get('revenue')
  revenue(@Query('range') range: 'daily' | 'weekly' | 'monthly', @Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.getRevenue(range, from, to);
  }

  @ApiOperation({ summary: 'Get bookings analytics' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date ISO string' })
  @ApiQuery({ name: 'to', required: false, description: 'End date ISO string' })
  @ApiResponse({ status: 200, description: 'Bookings analytics data' })
  @Get('bookings')
  bookings(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.getBookings(from, to);
  }

  @ApiOperation({ summary: 'Get conversion funnel analytics' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date ISO string' })
  @ApiQuery({ name: 'to', required: false, description: 'End date ISO string' })
  @ApiResponse({ status: 200, description: 'Funnel analytics data' })
  @Get('funnel')
  funnel(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.getFunnel(from, to);
  }

  @ApiOperation({ summary: 'Get user behavior analytics' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date ISO string' })
  @ApiQuery({ name: 'to', required: false, description: 'End date ISO string' })
  @ApiResponse({ status: 200, description: 'User behavior data' })
  @Get('user-behavior')
  userBehavior(@Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.getUserBehavior(from, to);
  }
}
