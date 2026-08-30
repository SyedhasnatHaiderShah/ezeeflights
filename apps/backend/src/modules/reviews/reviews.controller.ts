import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ListReviewsQueryDto } from "./dto/list-reviews.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("Reviews")
@Controller({ path: "reviews", version: "1" })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: "Get featured reviews" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Array of featured reviews" })
  @Get("featured")
  getFeatured(@Query("limit") limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 8;
    return this.reviewsService.getFeatured(Number.isFinite(parsed) ? parsed : 8);
  }

  @ApiOperation({ summary: "Get all public reviews" })
  @ApiResponse({ status: 200, description: "Reviews array or paginated response" })
  @Get("all")
  getAll(@Query() query: ListReviewsQueryDto) {
    return this.reviewsService.getAll({
      page: query.page,
      limit: query.limit,
      rating: query.rating,
      search: query.search,
    });
  }

  @ApiOperation({ summary: "Get review statistics" })
  @ApiResponse({ status: 200, description: "Review rating distribution and totals" })
  @Get("stats")
  getStats() {
    return this.reviewsService.getStats();
  }
}
