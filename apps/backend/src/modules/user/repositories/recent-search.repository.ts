import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { RecentSearchEntity } from '../entities/recent-search.entity';

@Injectable()
export class RecentSearchRepository {
  constructor(private readonly db: PostgresClient) {}

  async findByUserId(userId: string, limit = 8): Promise<RecentSearchEntity[]> {
    return this.db.query<RecentSearchEntity>(
      `SELECT 
        id, 
        user_id as "userId", 
        origin, 
        destination, 
        search_type as "searchType", 
        search_date as "searchDate", 
        metadata, 
        created_at as "createdAt"
      FROM user_recent_searches 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2`,
      [userId, limit],
    );
  }

  async create(data: {
    userId: string;
    origin: string;
    destination: string;
    searchType: string;
    searchDate?: Date | string | null;
    metadata?: any;
  }): Promise<RecentSearchEntity | null> {
    return this.db.queryOne<RecentSearchEntity>(
      `INSERT INTO user_recent_searches (
        user_id, origin, destination, search_type, search_date, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, 
        user_id as "userId", 
        origin, 
        destination, 
        search_type as "searchType", 
        search_date as "searchDate", 
        metadata, 
        created_at as "createdAt"`,
      [
        data.userId,
        data.origin,
        data.destination,
        data.searchType,
        data.searchDate || null,
        data.metadata || {},
      ],
    );
  }

  async deleteById(userId: string, id: string): Promise<boolean> {
    const row = await this.db.queryOne<{ id: string }>(
      'DELETE FROM user_recent_searches WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId],
    );
    return !!row;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.db.query('DELETE FROM user_recent_searches WHERE user_id = $1', [userId]);
  }
}
