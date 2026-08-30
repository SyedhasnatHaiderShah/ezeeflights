import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { WishlistRepository } from "../repositories/wishlist.repository";
import {
  WishlistPublicView,
  WishlistRecord,
} from "../entities/wishlist.entity";

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);
  constructor(private readonly repository: WishlistRepository) {}

  private toPublicView(row: WishlistRecord): WishlistPublicView {
    return {
      id: row.id,
      entityType: row.entityType,
      entityId: row.entityId,
      data: row.data,
      createdAt: row.createdAt,
    };
  }

  async getWishlist(params: {
    userId?: string;
    sessionId?: string;
  }): Promise<WishlistPublicView[]> {
    try {
      let rows: WishlistRecord[] = [];
      if (params.userId && params.userId !== "null" && params.userId !== "undefined") {
        rows = await this.repository.findByUserId(params.userId);
      } else if (params.sessionId) {
        rows = await this.repository.findBySessionId(params.sessionId);
      }
      return rows.map((r) => this.toPublicView(r));
    } catch (err: any) {
      this.logger.error(`Failed to get wishlist: ${err.message}`, err.stack);
      throw err;
    }
  }

  async toggleWishlist(params: {
    userId?: string;
    sessionId?: string;
    entityType: string;
    entityId: string;
    data?: any;
  }): Promise<{ action: "added" | "removed"; item?: WishlistPublicView }> {
    try {
      const existing = await this.repository.findOne({
        userId: params.userId && params.userId !== "null" ? params.userId : undefined,
        sessionId: params.sessionId,
        entityType: params.entityType,
        entityId: params.entityId,
      });

      if (existing) {
        await this.repository.delete(existing.id);
        return { action: "removed" };
      }

      if (!params.data) {
        throw new Error("Data is required to add to wishlist");
      }

      const newItem = await this.repository.create({
        userId: params.userId && params.userId !== "null" ? params.userId : undefined,
        sessionId: params.sessionId,
        entityType: params.entityType,
        entityId: params.entityId,
        data: params.data,
      });

      if (!newItem) {
        throw new Error("Failed to create wishlist item");
      }

      return { action: "added", item: this.toPublicView(newItem) };
    } catch (err: any) {
      this.logger.error(`Failed to toggle wishlist: ${err.message}`, err.stack);
      throw err;
    }
  }

  async getAllForAdmin(query: { limit: number; page: number }) {
    return this.repository.findAllAdmin(query);
  }
}
