import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalculatePremiumDto, PurchasePolicyDto, SubmitClaimDto } from './dto/insurance.dto';
import { CoverageLevel, InsurancePlanType } from './insurance.entity';
import { InsuranceService } from './insurance.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('insurance')
@Controller('v1/insurance')
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @Get('plans')
  getPlans(@Query('planType') planType?: InsurancePlanType, @Query('coverageLevel') coverageLevel?: CoverageLevel) {
    return this.service.getPlans(planType, coverageLevel);
  }

  @Get('plans/:id')
  getPlanById(@Param('id') id: string) {
    return this.service.getPlanById(id);
  }

  @Post('calculate')
  calculate(@Body() dto: CalculatePremiumDto) {
    return this.service.calculatePremiumFromDto(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('policies')
  purchasePolicy(@Req() req: AuthenticatedRequest, @Body() dto: PurchasePolicyDto) {
    return this.service.purchasePolicy(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('policies/me')
  myPolicies(@Req() req: AuthenticatedRequest) {
    return this.service.getMyPolicies(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('policies/:id')
  getPolicyById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getPolicyById(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('policies/:id')
  cancelPolicy(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.cancelPolicy(id, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('claims')
  submitClaim(@Req() req: AuthenticatedRequest, @Body() dto: SubmitClaimDto) {
    return this.service.submitClaim(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('claims/:id')
  getClaim(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getClaimById(id, req.user.userId);
  }
}
