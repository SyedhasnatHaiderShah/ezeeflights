import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalculatePremiumDto, PurchasePolicyDto, SubmitClaimDto } from './dto/insurance.dto';
import { CoverageLevel, InsurancePlanType } from './insurance.entity';
import { InsuranceService } from './insurance.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('Insurance')
@Controller('v1/insurance')
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @ApiOperation({ summary: 'List available insurance plans' })
  @ApiQuery({ name: 'planType', required: false, description: 'Filter by plan type' })
  @ApiQuery({ name: 'coverageLevel', required: false, description: 'Filter by coverage level' })
  @ApiResponse({ status: 200, description: 'Array of insurance plans' })
  @Get('plans')
  getPlans(@Query('planType') planType?: InsurancePlanType, @Query('coverageLevel') coverageLevel?: CoverageLevel) {
    return this.service.getPlans(planType, coverageLevel);
  }

  @ApiOperation({ summary: 'Get insurance plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiResponse({ status: 200, description: 'Insurance plan details' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @Get('plans/:id')
  getPlanById(@Param('id') id: string) {
    return this.service.getPlanById(id);
  }

  @ApiOperation({ summary: 'Calculate insurance premium' })
  @ApiResponse({ status: 200, description: 'Calculated premium amount' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('calculate')
  calculate(@Body() dto: CalculatePremiumDto) {
    return this.service.calculatePremiumFromDto(dto);
  }

  @ApiOperation({ summary: 'Purchase an insurance policy' })
  @ApiResponse({ status: 201, description: 'Policy purchased' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('policies')
  purchasePolicy(@Req() req: AuthenticatedRequest, @Body() dto: PurchasePolicyDto) {
    return this.service.purchasePolicy(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get my insurance policies' })
  @ApiResponse({ status: 200, description: 'Array of policies' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('policies/me')
  myPolicies(@Req() req: AuthenticatedRequest) {
    return this.service.getMyPolicies(req.user.userId);
  }

  @ApiOperation({ summary: 'Get insurance policy by ID' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Policy details' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('policies/:id')
  getPolicyById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getPolicyById(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel insurance policy' })
  @ApiParam({ name: 'id', description: 'Policy UUID' })
  @ApiResponse({ status: 200, description: 'Policy cancelled' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('policies/:id')
  cancelPolicy(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.cancelPolicy(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Submit an insurance claim' })
  @ApiResponse({ status: 201, description: 'Claim submitted' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('claims')
  submitClaim(@Req() req: AuthenticatedRequest, @Body() dto: SubmitClaimDto) {
    return this.service.submitClaim(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'Get insurance claim by ID' })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('claims/:id')
  getClaim(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.getClaimById(id, req.user.userId);
  }
}
