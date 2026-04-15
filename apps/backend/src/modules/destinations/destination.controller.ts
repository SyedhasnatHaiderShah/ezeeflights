import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Destinations')
@Controller({ path: '', version: '1' })
export class DestinationController {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly attractionService: AttractionService,
    private readonly wishlistService: WishlistService,
    private readonly aiRecommendationService: AiRecommendationService,
    private readonly mapService: MapService,
  ) {}

  @ApiOperation({ summary: 'List all destinations' })
  @ApiResponse({ status: 200, description: 'Array of destinations' })
  @Get('destinations')
  listDestinations() {
    return this.destinationService.getDestinations();
  }

  @ApiOperation({ summary: 'Get destinations by country' })
  @ApiParam({ name: 'country', description: 'Country name or code' })
  @ApiResponse({ status: 200, description: 'Array of destinations in country' })
  @Get('destinations/:country')
  country(@Param('country') country: string) {
    return this.destinationService.getCountryDestinations(country);
  }

  @ApiOperation({ summary: 'Get city landing page data' })
  @ApiParam({ name: 'slug', description: 'City slug' })
  @ApiResponse({ status: 200, description: 'City landing data' })
  @ApiResponse({ status: 404, description: 'City not found' })
  @Get('cities/:slug')
  city(@Param('slug') slug: string) {
    return this.destinationService.getCityLanding(slug);
  }

  @ApiOperation({ summary: 'Get upcoming events for a city' })
  @ApiParam({ name: 'slug', description: 'City slug' })
  @ApiResponse({ status: 200, description: 'Array of events' })
  @Get('cities/:slug/events')
  events(@Param('slug') slug: string, @Query() query: CityEventsQueryDto) {
    return this.destinationService.getCityEvents(slug, query);
  }

  @ApiOperation({ summary: 'List attractions with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated attraction list' })
  @Get('attractions')
  attractions(@Query() query: AttractionFilterDto) {
    return this.attractionService.list(query);
  }

  @ApiOperation({ summary: 'Get attraction by ID' })
  @ApiParam({ name: 'id', description: 'Attraction UUID' })
  @ApiResponse({ status: 200, description: 'Attraction details' })
  @ApiResponse({ status: 404, description: 'Attraction not found' })
  @Get('attractions/:id')
  attractionById(@Param('id') id: string) {
    return this.attractionService.getById(id);
  }

  @ApiOperation({ summary: 'Get available tours for an attraction' })
  @ApiParam({ name: 'id', description: 'Attraction UUID' })
  @ApiResponse({ status: 200, description: 'Array of tours' })
  @Get('attractions/:id/tours')
  tours(@Param('id') id: string, @Query() query: TourQueryDto) {
    return this.attractionService.getTours(id, query);
  }

  @ApiOperation({ summary: 'Get reviews for an attraction' })
  @ApiParam({ name: 'id', description: 'Attraction UUID' })
  @ApiResponse({ status: 200, description: 'Array of reviews' })
  @Get('attractions/:id/reviews')
  reviews(@Param('id') id: string) {
    return this.attractionService.listReviews(id);
  }

  @ApiOperation({ summary: 'Add review for an attraction' })
  @ApiParam({ name: 'id', description: 'Attraction UUID' })
  @ApiResponse({ status: 201, description: 'Review added' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('attractions/:id/review')
  addReview(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: CreateAttractionReviewDto) {
    return this.attractionService.addReview(req.user.userId, id, body);
  }

  @ApiOperation({ summary: 'Get nearby attractions/clusters for map view' })
  @ApiResponse({ status: 200, description: 'Map cluster data' })
  @Get('map/nearby')
  mapNearby(@Query() query: MapNearbyQueryDto) {
    return this.mapService.getClusters(query);
  }

  @ApiOperation({ summary: 'Add attraction to wishlist' })
  @ApiParam({ name: 'attractionId', description: 'Attraction UUID' })
  @ApiResponse({ status: 201, description: 'Added to wishlist' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('wishlist/:attractionId')
  addWishlist(@Req() req: AuthenticatedRequest, @Param() params: WishlistParamsDto) {
    return this.wishlistService.add(req.user.userId, params.attractionId);
  }

  @ApiOperation({ summary: 'Remove attraction from wishlist' })
  @ApiParam({ name: 'attractionId', description: 'Attraction UUID' })
  @ApiResponse({ status: 200, description: 'Removed from wishlist' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('wishlist/:attractionId')
  removeWishlist(@Req() req: AuthenticatedRequest, @Param() params: WishlistParamsDto) {
    return this.wishlistService.remove(req.user.userId, params.attractionId);
  }

  @ApiOperation({ summary: 'Get my wishlist' })
  @ApiResponse({ status: 200, description: 'Array of wishlist items' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('wishlist')
  wishlist(@Req() req: AuthenticatedRequest) {
    return this.wishlistService.list(req.user.userId);
  }

  @ApiOperation({ summary: 'Get AI-powered attraction recommendations' })
  @ApiResponse({ status: 200, description: 'Ranked attraction recommendations' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('ai/recommendations')
  recommendations(@Req() req: AuthenticatedRequest, @Query() query: AiRecommendationsQueryDto) {
    return this.aiRecommendationService.rankForUser(req.user.userId, query.city);
  }

  @ApiOperation({ summary: 'Get AI top 5 attractions for a city' })
  @ApiResponse({ status: 200, description: 'Top 5 attractions' })
  @Post('ai/top-attractions')
  topAttractions(@Body() body: AiTopAttractionsDto) {
    return this.aiRecommendationService.topFive(body);
  }
}
