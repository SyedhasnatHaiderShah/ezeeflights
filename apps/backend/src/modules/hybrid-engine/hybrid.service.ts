import { Injectable, Logger } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { HybridGeneratePackageDto } from './dto/hybrid.dto';
import { FlightProviderService } from './flight.provider';
import { HotelProviderService } from './hotel.provider';
import { PricingEngine } from './pricing.engine';
import { HybridCacheService } from './cache.service';
import { TravelTier } from './types/hybrid.types';

@Injectable()
export class HybridService {
  private readonly logger = new Logger(HybridService.name);

  constructor(
    private readonly flightProvider: FlightProviderService,
    private readonly hotelProvider: HotelProviderService,
    private readonly pricingEngine: PricingEngine,
    private readonly cache: HybridCacheService,
    private readonly db: PostgresClient,
  ) {}

  async generateLivePackage(dto: HybridGeneratePackageDto) {
    const startedAt = Date.now();
    const aiPlan = await this.getAiPlan(dto);

    const [flights, hotels] = await Promise.all([
      this.flightProvider.getFlights({
        origin: dto.origin ?? 'JFK',
        destination: dto.destination,
        date: dto.travelDates.startDate,
        travelers: dto.travelers,
        currency: dto.currency ?? 'USD',
      }),
      this.hotelProvider.getHotels({
        destination: dto.destination,
        checkIn: dto.travelDates.startDate,
        checkOut: dto.travelDates.endDate,
        travelers: dto.travelers,
        currency: dto.currency ?? 'USD',
      }),
    ]);

    const options = this.buildTieredOptions(aiPlan, flights, hotels, dto);

    await this.trackUsage({
      endpoint: 'generate-live-package',
      provider: flights[0]?.provider ?? 'unknown',
      costUsd: this.estimateAiCost(aiPlan.rawTokens ?? 0),
      latencyMs: Date.now() - startedAt,
    });

    return {
      destination: dto.destination,
      travelDates: dto.travelDates,
      travelers: dto.travelers,
      itinerary: aiPlan.itinerary,
      options,
      selectedDefaults: {
        flightId: options.standard.flight.id,
        hotelId: options.standard.hotel.id,
      },
      metadata: {
        liveData: {
          flightsSource: flights[0]?.provider ?? 'ai-estimate',
          hotelsSource: hotels[0]?.provider ?? 'ai-estimate',
        },
        priceRefreshAvailable: true,
      },
    };
  }

  recalculatePrice(input: {
    flightPrice: number;
    hotelPrice: number;
    activitiesCost: number;
    baseCurrency?: string;
    targetCurrency?: string;
    packageTier?: TravelTier;
    discountPct?: number;
  }) {
    return this.pricingEngine.recalculate(input);
  }

  private async getAiPlan(dto: HybridGeneratePackageDto): Promise<{ itinerary: Array<any>; rawTokens?: number }> {
    const cacheKey = `ai:${dto.destination}:${dto.travelDates.startDate}:${dto.travelDates.endDate}:${dto.travelers}`;
    const cached = await this.cache.get<{ itinerary: Array<any>; rawTokens?: number }>(cacheKey);
    if (cached) return cached;

    let payload: { itinerary: Array<any>; rawTokens?: number };
    if (!process.env.OPENAI_API_KEY) {
      payload = {
        rawTokens: 250,
        itinerary: this.fallbackItinerary(dto),
      };
    } else {
      try {
        const response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.AI_ITINERARY_MODEL ?? 'gpt-4.1-mini',
            input: [
              {
                role: 'system',
                content:
                  'Generate strict JSON with itinerary array by day, each object has day,title,activities(array),hotel_need(string). Keep concise and practical.',
              },
              {
                role: 'user',
                content: JSON.stringify(dto),
              },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI failed (${response.status})`);
        }

        const json = (await response.json()) as any;
        const parsed = JSON.parse(json.output_text ?? '{}');
        payload = {
          itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : this.fallbackItinerary(dto),
          rawTokens: Number(json.usage?.total_tokens ?? 0),
        };
      } catch (error) {
        this.logger.warn(`AI generation failed, using fallback itinerary: ${(error as Error).message}`);
        payload = {
          rawTokens: 200,
          itinerary: this.fallbackItinerary(dto),
        };
      }
    }

    await this.cache.set(cacheKey, payload, 3600);
    return payload;
  }

  private fallbackItinerary(dto: HybridGeneratePackageDto) {
    const msPerDay = 24 * 3600 * 1000;
    const dayCount = Math.max(1, Math.round((new Date(dto.travelDates.endDate).getTime() - new Date(dto.travelDates.startDate).getTime()) / msPerDay));
    return Array.from({ length: dayCount }).map((_, i) => ({
      day: i + 1,
      title: `${dto.destination} discovery day ${i + 1}`,
      activities: ['City highlights', 'Local food walk', 'Leisure window'],
      hotel_need: '4-star central hotel',
    }));
  }

  private buildTieredOptions(aiPlan: { itinerary: Array<any> }, flights: Array<any>, hotels: Array<any>, dto: HybridGeneratePackageDto) {
    const getFlight = (tier: TravelTier) => flights[this.flightIndexForTier(tier, flights.length)] ?? flights[0];
    const getHotel = (tier: TravelTier) => hotels[this.hotelIndexForTier(tier, hotels.length)] ?? hotels[0];

    const build = (tier: TravelTier) => {
      const flight = getFlight(tier);
      const hotel = getHotel(tier);
      const nights = Math.max(1, aiPlan.itinerary.length - 1);
      const price = this.pricingEngine.recalculate({
        flightPrice: flight.price,
        hotelPrice: hotel.pricePerNight * nights,
        activitiesCost: aiPlan.itinerary.length * (tier === 'luxury' ? 70 : tier === 'budget' ? 25 : 45),
        baseCurrency: dto.currency ?? 'USD',
        targetCurrency: dto.currency ?? 'USD',
        packageTier: tier,
      });

      return {
        tier,
        flight,
        hotel,
        pricing: price,
        itinerary: aiPlan.itinerary.map((day) => ({
          ...day,
          hotel: hotel.hotelName,
        })),
      };
    };

    return {
      budget: build('budget'),
      standard: build('standard'),
      luxury: build('luxury'),
    };
  }

  private flightIndexForTier(tier: TravelTier, size: number): number {
    if (size <= 1) return 0;
    if (tier === 'budget') return Math.min(size - 1, 0);
    if (tier === 'standard') return Math.min(size - 1, 1);
    return Math.min(size - 1, 2);
  }

  private hotelIndexForTier(tier: TravelTier, size: number): number {
    if (size <= 1) return 0;
    if (tier === 'budget') return Math.min(size - 1, 0);
    if (tier === 'standard') return Math.min(size - 1, 1);
    return Math.min(size - 1, 2);
  }

  private estimateAiCost(tokens: number): number {
    return Number(((tokens / 1000) * 0.003).toFixed(6));
  }

  private async trackUsage(payload: { endpoint: string; provider: string; costUsd: number; latencyMs: number }): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO hybrid_api_usage (endpoint, provider, estimated_cost_usd, latency_ms)
         VALUES ($1, $2, $3, $4)`,
        [payload.endpoint, payload.provider, payload.costUsd, payload.latencyMs],
      );
    } catch (error) {
      this.logger.warn(`Usage tracking skipped: ${(error as Error).message}`);
    }
  }
}
