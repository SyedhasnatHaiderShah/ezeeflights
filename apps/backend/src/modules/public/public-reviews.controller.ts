import { Controller, Get, Query, Logger } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from "@nestjs/swagger";
import { PublicReviewsService } from "./public-reviews.service";

@ApiTags("Public Reviews")
@Controller({ path: "reviews", version: "1" })
export class PublicReviewsController {
  constructor(private readonly reviewsService: PublicReviewsService) {}

  @ApiOperation({ summary: "Get all reviews with optional pagination" })
  @ApiResponse({
    status: 200,
    description: "Returns all reviews with optional pagination",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "rating", required: false, type: Number })
  @ApiQuery({ name: "category", required: false, type: String })
  @ApiQuery({ name: "verified", required: false, type: Boolean })
  @Get("all")
  async getAllReviews(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("rating") rating?: string,
    @Query("category") category?: string,
    @Query("verified") verified?: string,
  ) {
    Logger.log("GET /v1/reviews/all called", "PublicReviewsController");
    return this.reviewsService.getAllReviews(
      page,
      limit,
      rating,
      category,
      verified,
    );
  }

  @ApiOperation({ summary: "Get featured/top-rated reviews" })
  @ApiResponse({
    status: 200,
    description: "Returns top-rated reviews ordered by rating desc",
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @Get("featured")
  async getFeatured(@Query("limit") limit?: string) {
    Logger.log("GET /v1/reviews/featured called", "PublicReviewsController");
    return this.reviewsService.getFeatured(limit);
  }

  @ApiOperation({ summary: "Get review rating statistics" })
  @ApiResponse({
    status: 200,
    description: "Returns rating distribution, average, and total count",
  })
  @Get("stats")
  async getStats() {
    Logger.log("GET /v1/reviews/stats called", "PublicReviewsController");
    return this.reviewsService.getStats();
  }

  @ApiOperation({ summary: "Get paginated reviews list (root)" })
  @ApiResponse({ status: 200, description: "Returns paginated reviews" })
  @Get()
  async getReviewsRoot(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("rating") rating?: string,
    @Query("category") category?: string,
    @Query("verified") verified?: string,
  ) {
    Logger.log("GET /v1/reviews called", "PublicReviewsController");
    return this.reviewsService.getAllReviews(
      page,
      limit,
      rating,
      category,
      verified,
    );
  }
}
