import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HybridGeneratePackageDto, PricingRecalculateDto } from './dto/hybrid.dto';
import { HybridService } from './hybrid.service';

@ApiTags('Hybrid Search')
@Controller({ path: '', version: '1' })
@UseGuards(ThrottlerGuard)
export class HybridController {
  constructor(private readonly hybridService: HybridService) {}

  @ApiOperation({ summary: 'Generate live hybrid package combining flights, hotels, and activities' })
  @ApiResponse({ status: 200, description: 'Generated hybrid package with live pricing' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post('hybrid/generate-live-package')
  generate(@Body() dto: HybridGeneratePackageDto) {
    return this.hybridService.generateLivePackage(dto);
  }

  @ApiOperation({ summary: 'Recalculate package pricing with optional discounts and currency conversion' })
  @ApiResponse({ status: 200, description: 'Recalculated pricing breakdown' })
  @Get('pricing/recalculate')
  recalculate(@Query() query: PricingRecalculateDto) {
    return this.hybridService.recalculatePrice(query);
  }
}
