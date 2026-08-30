import { Injectable } from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import { publicReviewQualitySql } from "./review-quality.util";

export interface TblReviewRow {
  id: number;
  name: string;
  email: string;
  message: string;
  ranking_star: number;
  country: string;
  status: string;
  created_at: Date | string;
}

export interface ReviewListFilters {
  rating?: number;
  search?: string;
}

@Injectable()
export class ReviewsRepository {
  constructor(private readonly db: MysqlClient) {}

  private isMissingTableError(err: unknown): boolean {
    return (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "ER_NO_SUCH_TABLE"
    );
  }

  private normalizeSearch(search?: string): string | undefined {
    const term = String(search ?? "")
      .trim()
      .slice(0, 100)
      .replace(/[%_]/g, "");
    return term ? term.toLowerCase() : undefined;
  }

  private buildWhere(
    filters: ReviewListFilters = {},
  ): { clause: string; params: unknown[] } {
    const params: unknown[] = [];
    let clause = `WHERE status = '0'${publicReviewQualitySql()}`;

    if (filters.rating !== undefined) {
      clause += " AND ranking_star = ?";
      params.push(filters.rating);
    }

    const search = this.normalizeSearch(filters.search);
    if (search) {
      const pattern = `%${search}%`;
      clause +=
        " AND (LOWER(name) LIKE ? OR LOWER(message) LIKE ? OR LOWER(country) LIKE ?)";
      params.push(pattern, pattern, pattern);
    }

    return { clause, params };
  }

  async countReviews(filters: ReviewListFilters = {}): Promise<number> {
    const { clause, params } = this.buildWhere(filters);
    try {
      const row = await this.db.queryOne<{ total: number }>(
        `SELECT COUNT(*) AS total FROM tbl_review ${clause}`,
        params,
      );
      return Number(row?.total ?? 0);
    } catch (err) {
      if (this.isMissingTableError(err)) return 0;
      throw err;
    }
  }

  async findReviews(options: {
    rating?: number;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<TblReviewRow[]> {
    const { clause, params } = this.buildWhere({
      rating: options.rating,
      search: options.search,
    });
    try {
      return await this.db.query<TblReviewRow>(
        `SELECT id, name, email, message, ranking_star, country, status, created_at
         FROM tbl_review
         ${clause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, options.limit, options.offset],
      );
    } catch (err) {
      if (this.isMissingTableError(err)) return [];
      throw err;
    }
  }

  async getRatingDistribution(): Promise<Record<number, number>> {
    const { clause, params } = this.buildWhere();
    try {
      const rows = await this.db.query<{ ranking_star: number; count: number }>(
        `SELECT ranking_star, COUNT(*) AS count
         FROM tbl_review
         ${clause}
         GROUP BY ranking_star`,
        params,
      );

      const distribution: Record<number, number> = {};
      for (const row of rows) {
        distribution[Number(row.ranking_star)] = Number(row.count);
      }
      return distribution;
    } catch (err) {
      if (this.isMissingTableError(err)) return {};
      throw err;
    }
  }

  async getAverageRating(): Promise<number> {
    const { clause, params } = this.buildWhere();
    try {
      const row = await this.db.queryOne<{ average: number | string | null }>(
        `SELECT AVG(ranking_star) AS average
         FROM tbl_review
         ${clause}`,
        params,
      );
      return Number(row?.average ?? 0);
    } catch (err) {
      if (this.isMissingTableError(err)) return 0;
      throw err;
    }
  }
}
