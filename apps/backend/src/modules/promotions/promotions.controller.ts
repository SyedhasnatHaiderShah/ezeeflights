import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PromotionUpsertDto, PromotionValidateQueryDto } from './promotion.dto';
import { PromotionsService } from './promotions.service';
import { AdminPermission, AdminRbacGuard } from '../admin/rbac.middleware';
import { AdminPermissionAction } from '../admin/dto/admin.dto';

@ApiTags('Promotions')
@Controller({ path: 'promotions', version: '1' })
export class PromotionsController {
  constructor(private readonly service: PromotionsService) {}

  @ApiOperation({ summary: 'Get active promotions and campaigns' })
  @ApiResponse({ status: 200, description: 'Array of active campaigns' })
  @Get('campaigns/active')
  activeCampaigns() {
    return this.service.getActiveCampaigns();
  }

  @ApiOperation({ summary: 'Validate a promo code and calculate checkout discounts' })
  @ApiResponse({ status: 200, description: 'Promo validation result' })
  @Get('validate')
  validate(@Query() query: PromotionValidateQueryDto) {
    return this.service.validateCheckout(query);
  }
}

@ApiTags('Promotions Admin')
@Controller({ path: 'admin/promotions', version: '1' })
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminRbacGuard)
export class PromotionsAdminController {
  constructor(private readonly service: PromotionsService) {}

  @ApiOperation({ summary: 'List coupon promotions' })
  @ApiResponse({ status: 200, description: 'Coupon catalog' })
  @AdminPermission('SETTINGS', AdminPermissionAction.READ)
  @Get('coupons')
  coupons() {
    return this.service.listCoupons();
  }

  @ApiOperation({ summary: 'Create or update a coupon' })
  @ApiResponse({ status: 200, description: 'Saved coupon' })
  @AdminPermission('SETTINGS', AdminPermissionAction.CONFIGURE)
  @Post('coupons')
  saveCoupon(@Body() dto: PromotionUpsertDto) {
    return this.service.upsertCoupon(dto);
  }

  @ApiOperation({ summary: 'Delete a coupon' })
  @ApiResponse({ status: 200, description: 'Coupon deleted' })
  @AdminPermission('SETTINGS', AdminPermissionAction.DELETE)
  @Delete('coupons/:code')
  deleteCoupon(@Param('code') code: string) {
    return this.service.deleteCoupon(code).then(() => ({ success: true }));
  }

  @ApiOperation({ summary: 'List marketing campaigns' })
  @ApiResponse({ status: 200, description: 'Campaign catalog' })
  @AdminPermission('SETTINGS', AdminPermissionAction.READ)
  @Get('campaigns')
  campaigns() {
    return this.service.listCampaigns();
  }

  @ApiOperation({ summary: 'Create or update a marketing campaign' })
  @ApiResponse({ status: 200, description: 'Saved campaign' })
  @AdminPermission('SETTINGS', AdminPermissionAction.CONFIGURE)
  @Post('campaigns')
  saveCampaign(@Body() dto: PromotionUpsertDto) {
    return this.service.upsertCampaign(dto);
  }

  @ApiOperation({ summary: 'Delete a marketing campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  @AdminPermission('SETTINGS', AdminPermissionAction.DELETE)
  @Delete('campaigns/:code')
  deleteCampaign(@Param('code') code: string) {
    return this.service.deleteCampaign(code).then(() => ({ success: true }));
  }
}
