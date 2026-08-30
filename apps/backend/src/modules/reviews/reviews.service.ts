import { Injectable } from "@nestjs/common";
import { ReviewsRepository } from "./reviews.repository";
import {
  isPublicReviewEligible,
  sanitizeReviewText,
} from "./review-quality.util";

export interface PublicReviewDto {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorLocation: string;
  rating: number;
  text: string;
  isVerified: boolean;
  createdAt: string;
  category?: string;
}

export interface ReviewsPageDto {
  data: PublicReviewDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ReviewStatsDto {
  distribution: Record<number, number>;
  average: number;
  total: number;
}

const COUNTRY_LABELS: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  UK: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  IN: "India",
  AE: "United Arab Emirates",
};

@Injectable()
export class ReviewsService {
  constructor(private readonly repository: ReviewsRepository) {}

  private mapRow(row: {
    id: number;
    name: string;
    message: string;
    ranking_star: number;
    country: string;
    created_at: Date | string;
  }): PublicReviewDto | null {
    const authorName = String(row.name ?? "").trim() || "Traveler";
    const text = sanitizeReviewText(row.message);

    if (!isPublicReviewEligible(text, authorName)) {
      return null;
    }

    const country = String(row.country ?? "").trim().toUpperCase();

    return {
      id: String(row.id),
      authorName,
      authorAvatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(authorName)}`,
      authorLocation: COUNTRY_LABELS[country] ?? (country || "Global"),
      rating: Number(row.ranking_star) || 5,
      text,
      isVerified: true,
      createdAt: new Date(row.created_at).toISOString(),
      category: "flight-booking",
    };
  }

  private mapRows(
    rows: Array<{
      id: number;
      name: string;
      message: string;
      ranking_star: number;
      country: string;
      created_at: Date | string;
    }>,
  ): PublicReviewDto[] {
    return rows
      .map((row) => this.mapRow(row))
      .filter((review): review is PublicReviewDto => review !== null);
  }

  async getFeatured(limit = 8): Promise<PublicReviewDto[]> {
    const rows = await this.repository.findReviews({
      limit: Math.min(Math.max(limit, 1), 50),
      offset: 0,
    });
    return this.mapRows(rows);
  }

  async getAll(options: {
    page?: number;
    limit?: number;
    rating?: number;
    search?: string;
  }): Promise<PublicReviewDto[] | ReviewsPageDto> {
    const limit = Math.min(Math.max(options.limit ?? 10, 1), 50);
    const page = Math.max(options.page ?? 1, 1);
    const offset = (page - 1) * limit;
    const filters = { rating: options.rating, search: options.search };

    const [rows, total] = await Promise.all([
      this.repository.findReviews({ ...filters, limit, offset }),
      this.repository.countReviews(filters),
    ]);

    const data = this.mapRows(rows);

    if (options.page === undefined) {
      return data;
    }

    return { data, total, page, limit };
  }

  async getStats(): Promise<ReviewStatsDto> {
    const [distribution, average, total] = await Promise.all([
      this.repository.getRatingDistribution(),
      this.repository.getAverageRating(),
      this.repository.countReviews(),
    ]);

    return {
      distribution,
      average: Math.round(average * 10) / 10,
      total,
    };
  }
}
