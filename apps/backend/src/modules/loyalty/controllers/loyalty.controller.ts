import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EarnPointsDto } from '../dto/earn-points.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { LoyaltyService } from '../services/loyalty.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Loyalty')
@Controller({ path: 'loyalty', version: '1' })
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @ApiOperation({ summary: 'Get my loyalty account and points balance' })
  @ApiResponse({ status: 200, description: 'Loyalty account data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.service.getMyAccount(req.user.userId);
  }

  @ApiOperation({ summary: 'Get loyalty point transaction history' })
  @ApiResponse({ status: 200, description: 'Array of loyalty transactions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  transactions(@Req() req: AuthenticatedRequest) {
    return this.service.getTransactions(req.user.userId);
  }

  @ApiOperation({ summary: 'Redeem loyalty points' })
  @ApiResponse({ status: 200, description: 'Points redeemed successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient points or validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  redeem(@Req() req: AuthenticatedRequest, @Body() dto: RedeemPointsDto) {
    return this.service.redeemPoints(req.user.userId, dto.points, dto.referenceId);
  }

  @ApiOperation({ summary: 'Earn loyalty points for a booking (internal)' })
  @ApiResponse({ status: 200, description: 'Points earned' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('earn')
  earn(@Body() dto: EarnPointsDto) {
    return this.service.earnPoints(dto.userId, dto.bookingType, dto.bookingTotal, dto.currency, dto.referenceId);
  }
}
