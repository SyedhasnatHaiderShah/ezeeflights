import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsController as AnalyticsHandler } from './analytics.controller';

interface AuthenticatedRequest {
  user: { userId: string; roles?: string[] };
}

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('api/analytics')
export class AnalyticsRoutes {
  constructor(private readonly analytics: AnalyticsHandler) {}

  @Get('revenue')
  revenue(@Req() _req: AuthenticatedRequest, @Query('range') range?: 'daily' | 'weekly' | 'monthly', @Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.revenue(range ?? 'daily', from, to);
  }

  @Get('bookings')
  bookings(@Req() _req: AuthenticatedRequest, @Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.bookings(from, to);
  }

  @Get('funnel')
  funnel(@Req() _req: AuthenticatedRequest, @Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.funnel(from, to);
  }

  @Get('user-behavior')
  userBehavior(@Req() _req: AuthenticatedRequest, @Query('from') from?: string, @Query('to') to?: string) {
    return this.analytics.userBehavior(from, to);
  }
}
