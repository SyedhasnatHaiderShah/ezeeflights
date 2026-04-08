import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiRecommendationService } from './ai.recommendation.service';
import { AttractionService } from './attraction.service';
import { AiRecommendationsQueryDto, AiTopAttractionsDto, AttractionFilterDto, CityEventsQueryDto, CreateAttractionReviewDto, MapNearbyQueryDto, TourQueryDto, WishlistParamsDto } from './dto/destination.dto';
import { DestinationService } from './destination.service';
import { MapService } from './map.service';
import { WishlistService } from './wishlist.service';

interface AuthenticatedRequest {
  user: { userId: string };
}

@ApiTags('destinations')
@Controller({ path: '', version: '1' })
export class DestinationController {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly attractionService: AttractionService,
    private readonly wishlistService: WishlistService,
    private readonly aiRecommendationService: AiRecommendationService,
    private readonly mapService: MapService,
  ) {}

  @Get('destinations')
  listDestinations() {
    return this.destinationService.getDestinations();
  }

  @Get('destinations/:country')
  country(@Param('country') country: string) {
    return this.destinationService.getCountryDestinations(country);
  }

  @Get('cities/:slug')
  city(@Param('slug') slug: string) {
    return this.destinationService.getCityLanding(slug);
  }

  @Get('cities/:slug/events')
  events(@Param('slug') slug: string, @Query() query: CityEventsQueryDto) {
    return this.destinationService.getCityEvents(slug, query);
  }

  @Get('attractions')
  attractions(@Query() query: AttractionFilterDto) {
    return this.attractionService.list(query);
  }

  @Get('attractions/:id')
  attractionById(@Param('id') id: string) {
    return this.attractionService.getById(id);
  }

  @Get('attractions/:id/tours')
  tours(@Param('id') id: string, @Query() query: TourQueryDto) {
    return this.attractionService.getTours(id, query);
  }

  @Get('attractions/:id/reviews')
  reviews(@Param('id') id: string) {
    return this.attractionService.listReviews(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('attractions/:id/review')
  addReview(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CreateAttractionReviewDto) {
    return this.attractionService.addReview(req.user.userId, id, body);
  }

  @Get('map/nearby')
  mapNearby(@Query() query: MapNearbyQueryDto) {
    return this.mapService.getClusters(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wishlist/:attractionId')
  addWishlist(@Req() req: AuthenticatedRequest, @Param() params: WishlistParamsDto) {
    return this.wishlistService.add(req.user.userId, params.attractionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('wishlist/:attractionId')
  removeWishlist(@Req() req: AuthenticatedRequest, @Param() params: WishlistParamsDto) {
    return this.wishlistService.remove(req.user.userId, params.attractionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wishlist')
  wishlist(@Req() req: AuthenticatedRequest) {
    return this.wishlistService.list(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('ai/recommendations')
  recommendations(@Req() req: AuthenticatedRequest, @Query() query: AiRecommendationsQueryDto) {
    return this.aiRecommendationService.rankForUser(req.user.userId, query.city);
  }

  @Post('ai/top-attractions')
  topAttractions(@Body() body: AiTopAttractionsDto) {
    return this.aiRecommendationService.topFive(body);
  }
}
