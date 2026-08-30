import { Injectable, Logger } from '@nestjs/common';
import { FlightService } from './flight.service';
import { SearchFlightAdsDto } from '../dto/search-flight-ads.dto';
import { AdOfferEntity } from '../entities/ad-offer.entity';
import { AdClickRepository } from '../repositories/ad-click.repository';
import { AffiliateUrlBuilder } from '../utils/affiliate-url.builder';
import * as crypto from 'crypto';

@Injectable()
export class FlightAdsService {
  private readonly logger = new Logger(FlightAdsService.name);

  // In-memory TTL cache: key = cacheKey(dto), value = AdOfferEntity[]
  private readonly cache = new Map<string, { offers: AdOfferEntity[]; expiresAt: number }>();
  private static readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

  constructor(
    private readonly flightService: FlightService,
    private readonly adClickRepo: AdClickRepository,
    private readonly affiliateUrlBuilder: AffiliateUrlBuilder,
  ) {}

  async searchAds(dto: SearchFlightAdsDto): Promise<{ data: AdOfferEntity[]; total: number }> {
    const key = this.cacheKey(dto);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      this.logger.debug(`FlightAdsService: cache hit for ${key}`);
      return { data: cached.offers, total: cached.offers.length };
    }

    // 1. Reuse live Travelport results from FlightService
    const { data: liveFlights } = await this.flightService.searchFlights({
      ...dto,
      limit: (dto.adCount ?? 5) * 3, // fetch extra so we have choices after filter
      page: 1,
    });

    if (!liveFlights || liveFlights.length === 0) {
      return { data: [], total: 0 };
    }

    const discountPct = dto.discountPct ?? 0.10;
    const adCount = dto.adCount ?? 5;

    // 2. Build ad offers from top N results
    const offers: AdOfferEntity[] = liveFlights
      .slice(0, adCount)
      .map((flight) => {
        const id = crypto.randomUUID();
        const originalPrice = (flight as any).totalFare ?? flight.baseFare ?? 0;
        const displayPrice = parseFloat((originalPrice * (1 - discountPct)).toFixed(2));

        const deepLink = this.affiliateUrlBuilder.build({
          partner: 'SELF',   // swap for 'KIWI' etc when you have affiliate keys
          origin: flight.departureAirport,
          destination: flight.arrivalAirport,
          departureDate: flight.departureAt
            ? (flight.departureAt instanceof Date
                ? flight.departureAt
                : new Date(flight.departureAt)
              ).toISOString().slice(0, 10)
            : "",
          returnDate: dto.returnDate,
          adults: dto.adults,
          utmSource: dto.utmSource ?? 'direct',
          utmMedium: dto.utmMedium ?? 'ads',
          utmCampaign: dto.utmCampaign ?? 'flight-ads',
          ref: dto.ref,
          tCode: dto.tCode,
          flightId: flight.id,
          cabinClass: flight.cabinClass,
        });

        const expiresAt = new Date(Date.now() + FlightAdsService.CACHE_TTL_MS);

        return {
          id,
          flightId: flight.id,
          partnerCode: 'SELF',
          partnerName: 'Best Price Guarantee',
          partnerLogoUrl: undefined,
          origin: flight.departureAirport,
          destination: flight.arrivalAirport,
          departureAt: flight.departureAt,
          arrivalAt: flight.arrivalAt,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          stops: flight.stops,
          displayPrice,
          originalPrice,
          discountPct,
          currency: flight.currency,
          deepLinkUrl: deepLink,
          trackingClickUrl: `/v1/flights/ads/click/${id}`,
          utmSource: dto.utmSource,
          utmMedium: dto.utmMedium,
          utmCampaign: dto.utmCampaign,
          refCode: dto.ref,
          tCode: dto.tCode,
          cabinClass: flight.cabinClass,
          expiresAt,
          createdAt: new Date(),
        } as AdOfferEntity;
      });

    this.cache.set(key, { offers, expiresAt: Date.now() + FlightAdsService.CACHE_TTL_MS });

    // Persist impressions in DB before returning to ensure they exist if user clicks immediately
    try {
      await this.adClickRepo.insertImpressions(offers);
    } catch (err: any) {
      this.logger.error(`Failed to persist ad impressions: ${err.message}`);
    }

    return { data: offers, total: offers.length };
  }

  async recordClick(adOfferId: string, ip: string, userAgent: string, countryCode?: string): Promise<string> {
    let offer = await this.adClickRepo.findOfferById(adOfferId);

    // Fallback to in-memory cache if DB hasn't synced yet or had an error saving
    if (!offer) {
      for (const { offers } of this.cache.values()) {
        const found = offers.find(o => o.id === adOfferId);
        if (found) {
          offer = found;
          break;
        }
      }
    }

    if (!offer) throw new Error(`Ad offer ${adOfferId} not found or expired`);

    try {
      await this.adClickRepo.insertClick({
        id: crypto.randomUUID(),
        adOfferId,
        userIp: ip,
        userAgent,
        countryCode,
        clickedAt: new Date(),
        converted: false,
      });
    } catch (err: any) {
      this.logger.error(`Failed to persist click event in DB: ${err.message}`);
    }

    // Return the partner's deep link for the redirect
    return offer.deepLinkUrl;
  }

  async verifyDiscount(flightId: string): Promise<{ valid: boolean; displayPrice?: number; baseFare?: number; tax?: number; currency?: string }> {
    const offer = await this.adClickRepo.getLowestValidPriceByFlightId(flightId);
    if (!offer) {
      return { valid: false };
    }
    return {
      valid: true,
      displayPrice: offer.displayPrice,
      baseFare: offer.baseFare,
      tax: offer.tax,
      currency: offer.currency,
    };
  }

  private cacheKey(dto: SearchFlightAdsDto): string {
    return `ads:${dto.origin}:${dto.destination}:${dto.departureDate}:${dto.returnDate ?? ''}:${dto.adults}`;
  }
}
