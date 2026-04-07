import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EarnPointsDto } from '../dto/earn-points.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { LoyaltyService } from '../services/loyalty.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('loyalty')
@Controller({ path: 'loyalty', version: '1' })
export class LoyaltyController {
  constructor(private readonly service: LoyaltyService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.service.getMyAccount(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  transactions(@Req() req: AuthenticatedRequest) {
    return this.service.getTransactions(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  redeem(@Req() req: AuthenticatedRequest, @Body() dto: RedeemPointsDto) {
    return this.service.redeemPoints(req.user.userId, dto.points, dto.referenceId);
  }

  @Post('earn')
  earn(@Body() dto: EarnPointsDto) {
    return this.service.earnPoints(dto.userId, dto.amount, dto.referenceId);
  }
}
