import { Injectable } from '@nestjs/common';
import { MysqlClient } from '../../../database/mysql.client';
import { AdOfferEntity } from '../entities/ad-offer.entity';
import { AdClickEvent } from '../entities/ad-click-event.entity';

@Injectable()
export class AdClickRepository {
  constructor(private readonly db: MysqlClient) {}

  async insertImpressions(offers: AdOfferEntity[]): Promise<void> {
    if (offers.length === 0) return;

    for (const offer of offers) {
      const query = `
        INSERT INTO ad_offers (
          id, flight_id, partner_code, partner_name, partner_logo_url,
          origin, destination, departure_at, arrival_at,
          airline, flight_number, stops, display_price, original_price,
          discount_pct, currency, deep_link_url, tracking_click_url,
          utm_source, utm_medium, utm_campaign, ref_code, t_code,
          cabin_class, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO NOTHING
      `;

      await this.db.query(query, [
        offer.id,
        offer.flightId,
        offer.partnerCode,
        offer.partnerName,
        offer.partnerLogoUrl ?? null,
        offer.origin,
        offer.destination,
        offer.departureAt,
        offer.arrivalAt,
        offer.airline,
        offer.flightNumber,
        offer.stops,
        offer.displayPrice,
        offer.originalPrice,
        offer.discountPct,
        offer.currency,
        offer.deepLinkUrl,
        offer.trackingClickUrl,
        offer.utmSource ?? null,
        offer.utmMedium ?? null,
        offer.utmCampaign ?? null,
        offer.refCode ?? null,
        offer.tCode ?? null,
        offer.cabinClass,
        offer.expiresAt,
      ]);
    }
  }

  async findOfferById(id: string): Promise<AdOfferEntity | null> {
    const query = `
      SELECT
        id,
        flight_id as "flightId",
        partner_code as "partnerCode",
        partner_name as "partnerName",
        partner_logo_url as "partnerLogoUrl",
        origin,
        destination,
        departure_at as "departureAt",
        arrival_at as "arrivalAt",
        airline,
        flight_number as "flightNumber",
        stops,
        display_price::float8 as "displayPrice",
        original_price::float8 as "originalPrice",
        discount_pct::float8 as "discountPct",
        currency,
        deep_link_url as "deepLinkUrl",
        tracking_click_url as "trackingClickUrl",
        utm_source as "utmSource",
        utm_medium as "utmMedium",
        utm_campaign as "utmCampaign",
        ref_code as "refCode",
        t_code as "tCode",
        cabin_class as "cabinClass",
        expires_at as "expiresAt",
        created_at as "createdAt"
      FROM ad_offers
      WHERE id = $1 AND expires_at > NOW()
      LIMIT 1
    `;
    const rows = await this.db.query<AdOfferEntity>(query, [id]);
    return rows[0] ?? null;
  }

  async getLowestValidPriceByFlightId(flightId: string): Promise<{ displayPrice: number; currency: string; baseFare: number; tax: number } | null> {
    const query = `
      SELECT 
        display_price::float8 as "displayPrice",
        currency
      FROM ad_offers
      WHERE flight_id = $1 AND expires_at > NOW()
      ORDER BY display_price ASC
      LIMIT 1
    `;
    const rows = await this.db.query<{ displayPrice: number; currency: string }>(query, [flightId]);
    if (rows.length === 0) return null;
    
    // We assume 85% base fare and 15% tax based on the original discount calculation logic
    const displayPrice = rows[0].displayPrice;
    const baseFare = parseFloat((displayPrice * 0.85).toFixed(2));
    const tax = parseFloat((displayPrice * 0.15).toFixed(2));

    return {
      displayPrice,
      currency: rows[0].currency,
      baseFare,
      tax,
    };
  }

  async findAllOffers(): Promise<AdOfferEntity[]> {
    const query = `
      SELECT
        id,
        flight_id as "flightId",
        partner_code as "partnerCode",
        partner_name as "partnerName",
        partner_logo_url as "partnerLogoUrl",
        origin,
        destination,
        departure_at as "departureAt",
        arrival_at as "arrivalAt",
        airline,
        flight_number as "flightNumber",
        stops,
        display_price::float8 as "displayPrice",
        original_price::float8 as "originalPrice",
        discount_pct::float8 as "discountPct",
        currency,
        deep_link_url as "deepLinkUrl",
        tracking_click_url as "trackingClickUrl",
        utm_source as "utmSource",
        utm_medium as "utmMedium",
        utm_campaign as "utmCampaign",
        ref_code as "refCode",
        t_code as "tCode",
        cabin_class as "cabinClass",
        expires_at as "expiresAt",
        created_at as "createdAt"
      FROM ad_offers
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return this.db.query<AdOfferEntity>(query);
  }

  async updateOfferPrice(id: string, displayPrice: number, discountPct: number): Promise<void> {
    const query = `
      UPDATE ad_offers
      SET display_price = $2, discount_pct = $3
      WHERE id = $1
    `;
    await this.db.query(query, [id, displayPrice, discountPct]);
  }

  async insertClick(event: AdClickEvent): Promise<void> {
    const query = `
      INSERT INTO ad_click_events (
        id, ad_offer_id, user_ip, user_agent, country_code, clicked_at, converted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await this.db.query(query, [
      event.id,
      event.adOfferId,
      event.userIp || '0.0.0.0',
      event.userAgent,
      event.countryCode ?? null,
      event.clickedAt,
      event.converted,
    ]);
  }

  async markConverted(clickId: string, commissionAmount: number, commissionCurrency: string): Promise<void> {
    const query = `
      UPDATE ad_click_events
      SET converted = TRUE,
          commission_amount = $2,
          commission_currency = $3
      WHERE id = $1
    `;
    await this.db.query(query, [clickId, commissionAmount, commissionCurrency]);
  }
}
