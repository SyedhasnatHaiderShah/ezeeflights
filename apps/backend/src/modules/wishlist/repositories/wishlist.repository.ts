import { Injectable } from "@nestjs/common";
import { MysqlClient } from "../../../database/mysql.client";
import { WishlistRecord } from "../entities/wishlist.entity";

const WISHLIST_COLUMNS = `
  id,
  user_id as "userId",
  session_id as "sessionId",
  entity_type as "entityType",
  entity_id as "entityId",
  data,
  created_at as "createdAt",
  updated_at as "updatedAt"
`;

@Injectable()
export class WishlistRepository {
  constructor(private readonly db: MysqlClient) {}

  async findByUserId(userId: string): Promise<WishlistRecord[]> {
    return this.db.query<WishlistRecord>(
      `SELECT ${WISHLIST_COLUMNS} FROM wishlists WHERE user_id = $1::uuid ORDER BY created_at DESC`,
      [userId],
    );
  }

  async findBySessionId(sessionId: string): Promise<WishlistRecord[]> {
    return this.db.query<WishlistRecord>(
      `SELECT ${WISHLIST_COLUMNS} FROM wishlists WHERE session_id = $1 AND user_id IS NULL ORDER BY created_at DESC`,
      [sessionId],
    );
  }

  async findOne(params: {
    userId?: string;
    sessionId?: string;
    entityType: string;
    entityId: string;
  }): Promise<WishlistRecord | null> {
    if (params.userId && params.userId !== "null" && params.userId !== "undefined") {
      return this.db.queryOne<WishlistRecord>(
        `SELECT ${WISHLIST_COLUMNS} FROM wishlists WHERE user_id = $1::uuid AND entity_type = $2 AND entity_id = $3 LIMIT 1`,
        [params.userId, params.entityType, params.entityId],
      );
    }
    return this.db.queryOne<WishlistRecord>(
      `SELECT ${WISHLIST_COLUMNS} FROM wishlists WHERE session_id = $1 AND user_id IS NULL AND entity_type = $2 AND entity_id = $3 LIMIT 1`,
      [params.sessionId, params.entityType, params.entityId],
    );
  }

  async create(data: {
    userId?: string | null;
    sessionId?: string | null;
    entityType: string;
    entityId: string;
    data: any;
  }): Promise<WishlistRecord | null> {
    const userId = (data.userId && data.userId !== "null" && data.userId !== "undefined") ? data.userId : null;
    return this.db.queryOne<WishlistRecord>(
      `INSERT INTO wishlists (user_id, session_id, entity_type, entity_id, data)
       VALUES ($1${userId ? "::uuid" : ""}, $2, $3, $4, $5)
       RETURNING ${WISHLIST_COLUMNS}`,
      [userId, data.sessionId, data.entityType, data.entityId, data.data],
    );
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.db.queryOne<{ id: string }>(
      "DELETE FROM wishlists WHERE id = $1::uuid RETURNING id",
      [id],
    );
    return !!res;
  }

  async findAllAdmin(query: { limit: number; page: number }): Promise<(WishlistRecord & { userEmail?: string })[]> {
    const offset = (query.page - 1) * query.limit;
    return this.db.query<WishlistRecord & { userEmail?: string }>(
      `SELECT w.id, w.data, u.email as "userEmail", 
        w.user_id as "userId", w.session_id as "sessionId",
        w.entity_type as "entityType", w.entity_id as "entityId",
        w.created_at as "createdAt", w.updated_at as "updatedAt"
       FROM wishlists w
       LEFT JOIN users u ON w.user_id = u.id
       ORDER BY w.created_at DESC
       LIMIT $1 OFFSET $2`,
      [query.limit, offset]
    );
  }
}
