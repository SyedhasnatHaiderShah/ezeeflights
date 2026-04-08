import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HybridGeneratePackageDto, PricingRecalculateDto } from './dto/hybrid.dto';
import { HybridService } from './hybrid.service';

@Controller({ path: '', version: '1' })
@UseGuards(ThrottlerGuard)
export class HybridController {
  constructor(private readonly hybridService: HybridService) {}

  @Post('hybrid/generate-live-package')
  generate(@Body() dto: HybridGeneratePackageDto) {
    return this.hybridService.generateLivePackage(dto);
  }

  @Get('pricing/recalculate')
  recalculate(@Query() query: PricingRecalculateDto) {
    return this.hybridService.recalculatePrice(query);
  }
}
