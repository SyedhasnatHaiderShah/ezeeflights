import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostgresClient } from '../../database/postgres.client';

interface PublicReviewRow {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  authorLocation: string;
  rating: number;
  text: string;
  isVerified: boolean;
  category: string | null;
  createdAt: string;
}

interface ReviewsListResponse {
  data: PublicReviewRow[];
  total: number;
  page: number;
  limit: number;
}

@ApiTags('Public Airlines')
@Controller({ path: 'airlines', version: '1' })
export class PublicAirlinesController {
  @Get()
  getAirlines() {
    Logger.log('GET /v1/airlines called', 'PublicAirlinesController');
    return [
      { id: '1', name: 'Emirates', code: 'EK', logoUrl: 'https://images.unsplash.com/photo-1610642372651-fe6e7bc209ef?auto=format&fit=crop&q=80&w=100' },
      { id: '2', name: 'Qatar Airways', code: 'QR', logoUrl: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?auto=format&fit=crop&q=80&w=100' },
      { id: '3', name: 'British Airways', code: 'BA', logoUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&q=80&w=100' },
      { id: '4', name: 'Singapore Airlines', code: 'SQ', logoUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=100' },
      { id: '5', name: 'Turkish Airlines', code: 'TK', logoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=100' },
    ];
  }
}

@ApiTags('Public Reviews')
@Controller({ path: 'reviews', version: '1' })
export class PublicReviewsController {
  constructor(private readonly db: PostgresClient) {}

  @Get()
  async list(
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
    @Query('rating') ratingQuery?: string,
    @Query('category') category?: string,
    @Query('verified') verifiedQuery?: string,
  ): Promise<ReviewsListResponse> {
    const page = Math.max(1, Number(pageQuery ?? 1) || 1);
    const limit = Math.min(30, Math.max(1, Number(limitQuery ?? 9) || 9));
    const rating = ratingQuery ? Math.max(1, Math.min(5, Number(ratingQuery) || 0)) : undefined;
    const verified = verifiedQuery === undefined ? undefined : verifiedQuery === 'true';

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

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    const dataValues = [...values, limit, offset];

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
       ORDER BY created_at DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues,
    );

    const count = await this.db.queryOne<{ total: string }>(
      `SELECT COUNT(*)::text as total FROM public_reviews ${whereClause}`,
      values,
    );

    return {
      data,
      total: Number(count?.total ?? 0),
      page,
      limit,
    };
  }

  @Get('featured')
  async getFeatured(@Query('limit') limitQuery?: string): Promise<PublicReviewRow[]> {
    const limit = Math.min(20, Math.max(1, Number(limitQuery ?? 8) || 8));
    Logger.log('GET /v1/reviews/featured called', 'PublicReviewsController');
    return this.db.query<PublicReviewRow>(
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
       ORDER BY rating DESC, created_at DESC
       LIMIT $1`,
      [limit],
    );
  }

  @Get('stats')
  async getStats() {
    const rows = await this.db.query<{ rating: number; count: number }>(
      `SELECT rating, COUNT(*)::int as count
       FROM public_reviews
       GROUP BY rating
       ORDER BY rating DESC`,
    );

    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const weighted = rows.reduce((sum, row) => sum + row.rating * row.count, 0);
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
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

@Module({
  controllers: [PublicAirlinesController, PublicReviewsController],
  providers: [PostgresClient],
})
export class PublicModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('PublicModule initialized', 'PublicModule');
  }
}
