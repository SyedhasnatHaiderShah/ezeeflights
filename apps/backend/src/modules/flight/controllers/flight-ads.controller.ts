import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FlightAdsService } from '../services/flight-ads.service';
import { SearchFlightAdsDto } from '../dto/search-flight-ads.dto';

@ApiTags('Flight Ads')
@Controller({ path: '', version: '1' })
export class FlightAdsController {
  constructor(private readonly flightAdsService: FlightAdsService) {}

  /**
   * Returns sponsored/ad flight results alongside the regular search.
   * Call this in PARALLEL with GET /flights/search from your frontend.
   */
  @ApiOperation({ summary: 'Get flight ad offers (discounted partner results)' })
  @ApiResponse({ status: 200, description: 'List of ad offers with deep links' })
  @Get('flights/ads')
  async searchAds(@Query() dto: SearchFlightAdsDto) {
    return this.flightAdsService.searchAds(dto);
  }

  /**
   * Click tracker + redirect. Frontend should link to this URL
   * instead of deepLinkUrl directly so clicks are counted.
   */
  @ApiOperation({ summary: 'Track ad click and redirect to partner' })
  @Get('flights/ads/click/:id')
  async clickAd(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = (req.headers['cf-connecting-ip'] as string) || req.ip || '';
    const ua = req.headers['user-agent'] || '';
    const country = (req.headers['cf-ipcountry'] as string) || '';

    try {
      const redirectUrl = await this.flightAdsService.recordClick(id, ip, ua, country);
      return res.redirect(302, redirectUrl);
    } catch {
      return res.redirect(302, '/flights');
    }
  }

  /**
   * Verify if a flight has an active, valid discount offer.
   */
  @ApiOperation({ summary: 'Verify if a flight has an active discount offer' })
  @ApiResponse({ status: 200, description: 'Validation result and discount prices if valid' })
  @Get('flights/ads/verify/:flightId')
  async verifyDiscount(@Param('flightId') flightId: string) {
    return this.flightAdsService.verifyDiscount(flightId);
  }
}
