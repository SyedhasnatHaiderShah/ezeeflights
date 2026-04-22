import { Injectable } from "@nestjs/common";
import { PostgresClient } from "../../database/postgres.client";
import { PublicReviewRow, ReviewsListResponse } from "./interfaces";

@Injectable()
export class PublicReviewsService {
  constructor(private readonly db: PostgresClient) {}

  async getAllReviews(
    pageQuery?: string,
    limitQuery?: string,
    ratingQuery?: string,
    categoryQuery?: string,
    verifiedQuery?: string,
  ): Promise<ReviewsListResponse | PublicReviewRow[]> {
    const page = pageQuery ? Math.max(1, Number(pageQuery) || 1) : undefined;
    const rawLimit = Number(limitQuery ?? 10) || 10;
    const limit = [10, 20, 30].includes(rawLimit) ? rawLimit : 10;

    const rating = ratingQuery
      ? Math.max(1, Math.min(5, Number(ratingQuery) || 0))
      : undefined;
    const category = categoryQuery;
    const verified =
      verifiedQuery === undefined ? undefined : verifiedQuery === "true";

    const values: unknown[] = [];
    const where: string[] = [];

    if (rating) {
      values.push(rating);
      where.push(`rating = $${values.length}`);
    }
    if (category) {
      values.push(category);
      where.push(`LOWER(category) = LOWER($${values.length})`);
    }
    if (verified !== undefined) {
      values.push(verified);
      where.push(`is_verified = $${values.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const data = await this.db.query<PublicReviewRow>(
      `SELECT id,
              author_name as "authorName",
              author_avatar as "authorAvatar",
              author_location as "authorLocation",
              rating,
              text,
              is_verified as "isVerified",
              category,
              created_at::text as "createdAt"
       FROM public_reviews
       ${whereClause}
       ORDER BY created_at DESC`,
      values,
    );

    if (!page) return data;

    const count = await this.db.queryOne<{ total: string }>(
      `SELECT COUNT(*)::text as total FROM public_reviews ${whereClause}`,
      values,
    );

    const total = Number(count?.total ?? 0);
    const start = (page - 1) * limit;
    const paginated = data.slice(start, start + limit);

    return { data: paginated, total, page, limit };
  }

  async getFeatured(limitQuery?: string): Promise<PublicReviewRow[]> {
    const limit = Math.min(20, Math.max(1, Number(limitQuery ?? 8) || 8));
    return this.db.query<PublicReviewRow>(
      `SELECT id, author_name as "authorName", author_avatar as "authorAvatar", author_location as "authorLocation", rating, text, is_verified as "isVerified", category, created_at::text as "createdAt"
       FROM public_reviews ORDER BY rating DESC, created_at DESC LIMIT $1`,
      [limit],
    );
  }

  async getStats() {
    const rows = await this.db.query<{ rating: number; count: number }>(
      `SELECT rating, COUNT(*)::int as count FROM public_reviews GROUP BY rating ORDER BY rating DESC`,
    );

    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const weighted = rows.reduce((sum, row) => sum + row.rating * row.count, 0);
    const distribution: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    for (const row of rows) {
      distribution[row.rating] = row.count;
    }

    return {
      distribution,
      average: total > 0 ? Number((weighted / total).toFixed(1)) : 0,
      total,
    };
  }
}
