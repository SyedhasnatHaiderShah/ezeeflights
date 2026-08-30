import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminRbacGuard, AdminPermission } from '../../admin/rbac.middleware';
import { AdminPermissionAction } from '../../admin/dto/admin.dto';
import { AdClickRepository } from '../repositories/ad-click.repository';

@ApiTags('Admin Flight Ads')
@Controller({ path: 'admin/flights/ads', version: '1' })
@UseGuards(JwtAuthGuard, AdminRbacGuard)
export class AdminFlightAdsController {
  constructor(private readonly adClickRepo: AdClickRepository) {}

  @ApiOperation({ summary: 'List all flight ads for admin management' })
  @ApiResponse({ status: 200, description: 'List of ad offers' })
  @ApiBearerAuth()
  @AdminPermission('FLIGHTS.ADS', AdminPermissionAction.READ)
  @Get()
  async listAds() {
    return this.adClickRepo.findAllOffers();
  }

  @ApiOperation({ summary: 'Update price of a flight ad' })
  @ApiResponse({ status: 200, description: 'Price updated' })
  @ApiBearerAuth()
  @AdminPermission('FLIGHTS.ADS', AdminPermissionAction.WRITE)
  @Patch(':id')
  async updateAdPrice(
    @Param('id') id: string,
    @Body() body: { displayPrice: number; discountPct: number },
  ) {
    await this.adClickRepo.updateOfferPrice(id, body.displayPrice, body.discountPct);
    return { success: true, id, displayPrice: body.displayPrice, discountPct: body.discountPct };
  }
}
