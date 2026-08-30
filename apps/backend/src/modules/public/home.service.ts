import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class HomeService {
  constructor(private readonly dataSource: DataSource) {}

  async getTopDestinations(limit: number) {
    const results = await this.dataSource.query(
      `SELECT * FROM tbl_topdestinations WHERE is_featured = 1 LIMIT ?`,
      [limit],
    );
    return results.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      country: r.country,
      code: r.code,
      region: r.region,
      heroImage: r.hero_image,
      imageUrl: r.hero_image,
      description: r.description,
      fromPrice: parseFloat(r.from_price),
      currency: r.currency,
      slug: r.slug,
      isFeatured: r.is_featured === 1,
    }));
  }

  async getFlightDeals(limit: number) {
    const results = await this.dataSource.query(
      `SELECT * FROM tbl_flightdeals LIMIT ?`,
      [limit],
    );
    return results.map((r: any) => ({
      id: String(r.id),
      type: "flight",
      title: r.title,
      originCity: r.origin_city,
      destinationCity: r.destination,
      airline: r.airline_name,
      price: parseFloat(r.base_price),
      originalPrice: Math.round(parseFloat(r.base_price) * 1.2), // Mock original price
      savingPercent: 20, // Mock saving
      expiresAt: r.expires_at,
      imageUrl: r.thumbnail_url,
      isFlashSale: r.is_flash_sale === 1,
    }));
  }

  async getPopularPackages(limit: number) {
    const results = await this.dataSource.query(
      `SELECT * FROM tbl_popularpackage LIMIT ?`,
      [limit],
    );
    return {
      data: results.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        slug: r.slug,
        destination: r.destination,
        country: r.country,
        durationDays: r.duration_days,
        basePrice: parseFloat(r.base_price),
        currency: r.currency,
        thumbnailUrl: r.thumbnail_url,
        status: "published",
        isFlashSale: r.is_flash_sale === 1,
        expiresAt: r.expires_at,
        type: "package",
      })),
      total: results.length,
    };
  }
}
