import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { PromotionKind, PromotionUpsertDto, PromotionValidateQueryDto } from './promotion.dto';

type PromotionSource = 'coupon' | 'campaign';

type PromotionCatalog = {
  coupons: PromotionUpsertDto[];
  campaigns: PromotionUpsertDto[];
};

type BookingSnapshot = {
  id: string;
  userId: string;
  totalAmount: number;
  totalPrice: number;
  currency: string;
};

type PromotionMatch = {
  code: string;
  title: string;
  description?: string;
  kind: PromotionKind;
  source: PromotionSource;
  amount: number;
  autoApply: boolean;
  flashSale: boolean;
  endsAt?: string;
  message: string;
};

@Injectable()
export class PromotionsService {
  private readonly catalogKey = 'promotions.catalog';

  constructor(private readonly db: PostgresClient) {}

  async listCoupons(): Promise<PromotionUpsertDto[]> {
    return (await this.getCatalog()).coupons;
  }

  async listCampaigns(): Promise<PromotionUpsertDto[]> {
    return (await this.getCatalog()).campaigns;
  }

  async upsertCoupon(dto: PromotionUpsertDto): Promise<PromotionUpsertDto> {
    return this.upsertRecord('coupons', dto);
  }

  async deleteCoupon(code: string): Promise<void> {
    await this.deleteRecord('coupons', code);
  }

  async upsertCampaign(dto: PromotionUpsertDto): Promise<PromotionUpsertDto> {
    return this.upsertRecord('campaigns', dto);
  }

  async deleteCampaign(code: string): Promise<void> {
    await this.deleteRecord('campaigns', code);
  }

  async getActiveCampaigns(): Promise<Array<PromotionUpsertDto & { countdownEndsAt?: string | null }>> {
    const catalog = await this.getCatalog();
    const now = new Date();
    return [
      ...catalog.coupons,
      ...catalog.campaigns,
    ]
      .map((promotion) => ({ ...promotion, countdownEndsAt: this.getEndsAt(promotion) }))
      .filter(
        (promotion) =>
          (promotion.autoApply || promotion.flashSale || Boolean(promotion.campaignTag)) &&
          this.isPromotionVisible(promotion, now) &&
          this.isPromotionEligibleForCampaign(promotion, now),
      );
  }

  async validateCheckout(query: PromotionValidateQueryDto) {
    const booking = await this.db.queryOne<BookingSnapshot>(
      `SELECT id, user_id as "userId", total_amount::float8 as "totalAmount", total_price::float8 as "totalPrice", currency
       FROM bookings
       WHERE id = $1`,
      [query.bookingId],
    );

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const travelerCount = await this.getTravelerCount(query.bookingId, query.travelers);
    const bookingCount = await this.getBookingCount(booking.userId);
    const loyaltyTier = await this.getLoyaltyTier(booking.userId);
    const subtotal = this.round(Number(booking.totalPrice || booking.totalAmount || 0));
    const catalog = await this.getCatalog();
    const now = new Date();
    const context = {
      booking,
      travelerCount,
      bookingCount,
      loyaltyTier,
      subtotal,
      currency: (query.currency ?? booking.currency ?? 'USD').toUpperCase(),
      partnerCode: query.partnerCode?.trim().toUpperCase() || undefined,
      now,
    };

    const autoMatches = this.getAutomaticMatches(catalog, context);
    const code = query.code?.trim().toUpperCase();
    const codeMatch = code ? this.matchCodePromotion(catalog, code, context) : null;

    const appliedDiscounts = [...autoMatches, ...(codeMatch?.status === 'VALID' && codeMatch.match ? [codeMatch.match] : [])];
    const discountAmount = Math.min(subtotal, appliedDiscounts.reduce((sum, item) => sum + item.amount, 0));
    const finalSubtotal = this.round(Math.max(0, subtotal - discountAmount));

    const flashSale = appliedDiscounts.find((item) => item.flashSale) ?? autoMatches.find((item) => item.flashSale) ?? null;

    return {
      bookingId: booking.id,
      subtotal,
      currency: context.currency,
      travelerCount,
      bookingCount,
      loyaltyTier,
      promoCode: code ?? null,
      promoStatus: codeMatch?.status ?? 'NOT_PROVIDED',
      promoMessage: codeMatch?.message ?? 'Enter a promo code to validate checkout discounts.',
      appliedDiscounts,
      totalDiscount: this.round(discountAmount),
      finalSubtotal,
      flashSaleEndsAt: flashSale?.endsAt ?? null,
      recommendations: this.getCampaignRecommendations(catalog, context),
    };
  }

  private async getCatalog(): Promise<PromotionCatalog> {
    const row = await this.db.queryOne<{ value: Record<string, unknown> }>(
      'SELECT value FROM system_settings WHERE key = $1',
      [this.catalogKey],
    );

    if (!row?.value) {
      const defaults = this.defaultCatalog();
      await this.saveCatalog(defaults);
      return defaults;
    }

    return this.normalizeCatalog(row.value);
  }

  private async saveCatalog(catalog: PromotionCatalog): Promise<void> {
    await this.db.query(
      `INSERT INTO system_settings (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [this.catalogKey, JSON.stringify(catalog)],
    );
  }

  private async upsertRecord(collection: keyof PromotionCatalog, dto: PromotionUpsertDto): Promise<PromotionUpsertDto> {
    const catalog = await this.getCatalog();
    const normalized = this.normalizePromotion(dto);
    const items = catalog[collection].filter((item) => item.code.toUpperCase() !== normalized.code.toUpperCase());
    items.unshift(normalized);
    const updated: PromotionCatalog = { ...catalog, [collection]: items };
    await this.saveCatalog(updated);
    return normalized;
  }

  private async deleteRecord(collection: keyof PromotionCatalog, code: string): Promise<void> {
    const catalog = await this.getCatalog();
    const remaining = catalog[collection].filter((item) => item.code.toUpperCase() !== code.toUpperCase());
    if (remaining.length === catalog[collection].length) {
      throw new NotFoundException('Promotion not found');
    }
    await this.saveCatalog({ ...catalog, [collection]: remaining });
  }

  private normalizeCatalog(raw: Record<string, unknown>): PromotionCatalog {
    const coupons = this.normalizePromotionArray(raw.coupons);
    const campaigns = this.normalizePromotionArray(raw.campaigns);
    return { coupons, campaigns };
  }

  private normalizePromotionArray(value: unknown): PromotionUpsertDto[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => this.normalizePromotion(item as Partial<PromotionUpsertDto>));
  }

  private normalizePromotion(item: Partial<PromotionUpsertDto>): PromotionUpsertDto {
    if (!item.code || !item.title) {
      throw new BadRequestException('Promotion code and title are required');
    }
    return {
      code: item.code.trim().toUpperCase(),
      title: item.title.trim(),
      description: item.description?.trim(),
      kind: item.kind ?? PromotionKind.PERCENT,
      value: Number(item.value ?? 0),
      active: item.active ?? true,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      minSubtotal: item.minSubtotal,
      minTravelers: item.minTravelers,
      firstBookingOnly: item.firstBookingOnly,
      memberOnly: item.memberOnly,
      partnerCode: item.partnerCode?.trim().toUpperCase(),
      campaignTag: item.campaignTag?.trim().toUpperCase(),
      autoApply: item.autoApply ?? false,
      flashSale: item.flashSale ?? false,
      maxDiscount: item.maxDiscount,
      usageLimit: item.usageLimit,
      redeemedCount: item.redeemedCount ?? 0,
    };
  }

  private defaultCatalog(): PromotionCatalog {
    const now = new Date();
    const plusHours = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

    return {
      coupons: [
        {
          code: 'WELCOME10',
          title: 'First booking welcome offer',
          description: '10% off your first confirmed booking',
          kind: PromotionKind.PERCENT,
          value: 10,
          active: true,
          firstBookingOnly: true,
          autoApply: false,
          redeemedCount: 0,
        },
        {
          code: 'PARTNER15',
          title: 'Partner rate match',
          description: '15% partner discount for direct rate matching',
          kind: PromotionKind.PERCENT,
          value: 15,
          active: true,
          partnerCode: 'PARTNER15',
          autoApply: false,
          redeemedCount: 0,
        },
      ],
      campaigns: [
        {
          code: 'FLASH24',
          title: 'Flash sale',
          description: 'Limited-time 12% flash sale with live countdown',
          kind: PromotionKind.PERCENT,
          value: 12,
          active: true,
          autoApply: true,
          flashSale: true,
          endsAt: plusHours(24),
          redeemedCount: 0,
        },
        {
          code: 'MEMBERRATE',
          title: 'Member-exclusive rate',
          description: '7% off for logged-in members',
          kind: PromotionKind.PERCENT,
          value: 7,
          active: true,
          autoApply: true,
          memberOnly: true,
          redeemedCount: 0,
        },
        {
          code: 'BULK8',
          title: 'Bulk booking discount',
          description: '8% off for groups of 4+ travelers',
          kind: PromotionKind.PERCENT,
          value: 8,
          active: true,
          autoApply: true,
          minTravelers: 4,
          redeemedCount: 0,
        },
        {
          code: 'SUMMER15',
          title: 'Summer campaign',
          description: '15% seasonal summer savings',
          kind: PromotionKind.PERCENT,
          value: 15,
          active: true,
          autoApply: true,
          campaignTag: 'SUMMER',
          redeemedCount: 0,
        },
        {
          code: 'EID20',
          title: 'Eid campaign',
          description: '20% savings for Eid campaigns',
          kind: PromotionKind.PERCENT,
          value: 20,
          active: true,
          autoApply: true,
          campaignTag: 'EID',
          redeemedCount: 0,
        },
        {
          code: 'SCHOOL10',
          title: 'Back-to-school campaign',
          description: '10% off family school season trips',
          kind: PromotionKind.PERCENT,
          value: 10,
          active: true,
          autoApply: true,
          campaignTag: 'BACK_TO_SCHOOL',
          redeemedCount: 0,
        },
      ],
    };
  }

  private getAutomaticMatches(catalog: PromotionCatalog, context: { booking: BookingSnapshot; travelerCount: number; bookingCount: number; loyaltyTier: string; subtotal: number; currency: string; partnerCode?: string; now: Date; }): PromotionMatch[] {
    return [...catalog.coupons, ...catalog.campaigns]
      .filter((promotion) => promotion.autoApply)
      .map((promotion) => this.evaluatePromotion(promotion, context, 'campaign'))
      .filter((match): match is PromotionMatch => match !== null);
  }

  private matchCodePromotion(catalog: PromotionCatalog, code: string, context: { booking: BookingSnapshot; travelerCount: number; bookingCount: number; loyaltyTier: string; subtotal: number; currency: string; partnerCode?: string; now: Date; }): { status: 'VALID' | 'INVALID' | 'NOT_ELIGIBLE'; message: string; match?: PromotionMatch } {
    const rule = [...catalog.coupons, ...catalog.campaigns].find((promotion) => promotion.code.toUpperCase() === code.toUpperCase());
    if (!rule) {
      return { status: 'INVALID', message: 'Promo code not found.' };
    }

    const match = this.evaluatePromotion(rule, context, catalog.campaigns.some((campaign) => campaign.code === rule.code) ? 'campaign' : 'coupon');
    if (!match) {
      return { status: 'NOT_ELIGIBLE', message: 'Promo code is not eligible for this booking.' };
    }

    return { status: 'VALID', message: match.message, match };
  }

  private evaluatePromotion(
    promotion: PromotionUpsertDto,
    context: { booking: BookingSnapshot; travelerCount: number; bookingCount: number; loyaltyTier: string; subtotal: number; currency: string; partnerCode?: string; now: Date; },
    source: PromotionSource,
  ): PromotionMatch | null {
    if (!promotion.active) return null;
    if (!this.isWithinDateRange(promotion, context.now)) return null;
    if (promotion.minSubtotal && context.subtotal < promotion.minSubtotal) return null;
    if (promotion.minTravelers && context.travelerCount < promotion.minTravelers) return null;
    if (promotion.firstBookingOnly && context.bookingCount > 0) return null;
    if (promotion.memberOnly && context.loyaltyTier === 'BRONZE') return null;
    if (promotion.partnerCode && promotion.partnerCode !== context.partnerCode) return null;
    if (promotion.campaignTag && !this.isCampaignActiveByTag(promotion.campaignTag, context.now)) return null;
    if (promotion.flashSale && !this.isFlashSaleActive(promotion, context.now)) return null;
    if (typeof promotion.usageLimit === 'number' && typeof promotion.redeemedCount === 'number' && promotion.redeemedCount >= promotion.usageLimit) {
      return null;
    }

    const amount = this.calculateDiscountAmount(promotion, context.subtotal);
    if (amount <= 0) return null;

    return {
      code: promotion.code,
      title: promotion.title,
      description: promotion.description,
      kind: promotion.kind,
      source,
      amount,
      autoApply: Boolean(promotion.autoApply),
      flashSale: Boolean(promotion.flashSale),
      endsAt: promotion.endsAt,
      message: `${promotion.title} applied successfully.`,
    };
  }

  private getCampaignRecommendations(catalog: PromotionCatalog, context: { booking: BookingSnapshot; travelerCount: number; bookingCount: number; loyaltyTier: string; subtotal: number; currency: string; partnerCode?: string; now: Date; }) {
    return [...catalog.campaigns]
      .map((promotion) => ({
        code: promotion.code,
        title: promotion.title,
        description: promotion.description,
        active: Boolean(this.evaluatePromotion(promotion, context, 'campaign')),
        endsAt: promotion.endsAt ?? null,
      }))
      .filter((item) => item.active)
      .slice(0, 6);
  }

  private async getTravelerCount(bookingId: string, override?: number): Promise<number> {
    if (typeof override === 'number' && override > 0) return override;
    const row = await this.db.queryOne<{ count: number }>(
      'SELECT count(*)::int as count FROM booking_passengers WHERE booking_id = $1',
      [bookingId],
    );
    return row?.count ?? 1;
  }

  private async getBookingCount(userId: string): Promise<number> {
    const row = await this.db.queryOne<{ count: number }>(
      "SELECT count(*)::int as count FROM bookings WHERE user_id = $1 AND status <> 'CANCELLED'",
      [userId],
    );
    return row?.count ?? 0;
  }

  private async getLoyaltyTier(userId: string): Promise<string> {
    const row = await this.db.queryOne<{ tier: string }>('SELECT loyalty_tier as tier FROM users WHERE id = $1', [userId]);
    return row?.tier ?? 'BRONZE';
  }

  private calculateDiscountAmount(promotion: PromotionUpsertDto, subtotal: number): number {
    const value = Number(promotion.value ?? 0);
    const raw = promotion.kind === PromotionKind.PERCENT ? subtotal * (value / 100) : value;
    const capped = typeof promotion.maxDiscount === 'number' ? Math.min(raw, promotion.maxDiscount) : raw;
    return this.round(Math.max(0, Math.min(subtotal, capped)));
  }

  private isWithinDateRange(promotion: PromotionUpsertDto, now: Date): boolean {
    if (promotion.startsAt && new Date(promotion.startsAt) > now) return false;
    if (promotion.endsAt && new Date(promotion.endsAt) < now) return false;
    return true;
  }

  private isCampaignActiveByTag(tag: string, now: Date): boolean {
    const month = now.getUTCMonth() + 1;
    const tagMap: Record<string, number[]> = {
      EID: [3, 4, 5],
      CHRISTMAS: [12],
      SUMMER: [6, 7, 8],
      BACK_TO_SCHOOL: [8, 9],
    };
    const allowed = tagMap[tag.toUpperCase()];
    return allowed ? allowed.includes(month) : true;
  }

  private isFlashSaleActive(promotion: PromotionUpsertDto, now: Date): boolean {
    if (!promotion.flashSale) return false;
    if (!promotion.endsAt) return true;
    return new Date(promotion.endsAt) >= now;
  }

  private isPromotionEligibleForCampaign(promotion: PromotionUpsertDto, now: Date): boolean {
    if (!promotion.active) return false;
    if (promotion.flashSale) return this.isFlashSaleActive(promotion, now);
    if (promotion.campaignTag) return this.isCampaignActiveByTag(promotion.campaignTag, now);
    return true;
  }

  private isPromotionVisible(promotion: PromotionUpsertDto, now: Date): boolean {
    return promotion.active !== false && this.isWithinDateRange(promotion, now);
  }

  private getEndsAt(promotion: PromotionUpsertDto): string | undefined {
    return promotion.endsAt;
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}
