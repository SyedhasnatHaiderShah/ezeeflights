import { Injectable, Logger } from '@nestjs/common';
import { HybridCacheService } from './cache.service';
import { NormalizedHotelOption } from './types/hybrid.types';

@Injectable()
export class HotelProviderService {
  private readonly logger = new Logger(HotelProviderService.name);
  private circuitOpenedAt: number | null = null;
  private failureCount = 0;

  constructor(private readonly cache: HybridCacheService) {}

  async getHotels(params: { destination: string; checkIn: string; checkOut: string; travelers: number; currency?: string }): Promise<NormalizedHotelOption[]> {
    const cacheKey = `hotel:${params.destination}:${params.checkIn}`;
    const cached = await this.cache.get<NormalizedHotelOption[]>(cacheKey);
    if (cached) return cached;

    const providers = [
      { name: 'booking', key: process.env.BOOKING_COM_API_KEY, baseUrl: process.env.BOOKING_COM_BASE_URL },
      { name: 'expedia', key: process.env.EXPEDIA_API_KEY, baseUrl: process.env.EXPEDIA_BASE_URL },
    ];

    for (const provider of providers) {
      const rows = await this.fetchProviderHotels(provider.name, provider.baseUrl, provider.key, params);
      if (rows.length > 0) {
        await this.cache.set(cacheKey, rows, 900);
        return rows;
      }
    }

    return this.fallbackHotels(params);
  }

  private async fetchProviderHotels(
    provider: string,
    baseUrl: string | undefined,
    apiKey: string | undefined,
    params: { destination: string; checkIn: string; checkOut: string; travelers: number; currency?: string },
  ): Promise<NormalizedHotelOption[]> {
    if (!baseUrl || !apiKey) {
      return [];
    }

    if (this.isCircuitOpen()) {
      this.logger.warn(`Circuit open for ${provider} hotel API; skipping requests.`);
      return [];
    }

    try {
      const result = await this.requestWithRetry(async () => {
        const response = await fetch(`${baseUrl}/hotels/search`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Hotel provider ${provider} failed (${response.status})`);
        }

        return response.json() as Promise<any>;
      });

      this.resetCircuit();
      return this.normalize(provider, result);
    } catch (error) {
      this.recordFailure();
      this.logger.warn(`Hotel provider ${provider} failed: ${(error as Error).message}`);
      return [];
    }
  }

  normalize(provider: string, payload: any): NormalizedHotelOption[] {
    const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return rows.map((row: any, idx: number) => ({
      provider,
      id: String(row.id ?? `${provider}-${idx}`),
      hotelName: String(row.hotel_name ?? row.name ?? 'Curated Hotel'),
      rating: Number(row.rating ?? row.stars ?? 4),
      amenities: Array.isArray(row.amenities) ? row.amenities.map(String) : [],
      pricePerNight: Number(row.price_per_night ?? row.price?.amount ?? row.price ?? 0),
      currency: String(row.price?.currency ?? row.currency ?? 'USD'),
    }));
  }

  private fallbackHotels(params: { destination: string; checkIn: string; checkOut: string; travelers: number; currency?: string }): NormalizedHotelOption[] {
    return [
      {
        provider: 'ai-estimate',
        id: 'fallback-hotel-1',
        hotelName: `${params.destination} Central Stay`,
        rating: 4.2,
        amenities: ['wifi', 'breakfast', 'airport transfer'],
        pricePerNight: 140,
        currency: params.currency ?? 'USD',
      },
    ];
  }

  private async requestWithRetry<T>(callback: () => Promise<T>): Promise<T> {
    const retries = 2;
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await callback();
      } catch (error) {
        lastError = error as Error;
      }
    }
    throw lastError ?? new Error('Provider request failed');
  }

  private isCircuitOpen(): boolean {
    if (this.circuitOpenedAt === null) return false;
    const coolDownMs = 30_000;
    if (Date.now() - this.circuitOpenedAt > coolDownMs) {
      this.circuitOpenedAt = null;
      this.failureCount = 0;
      return false;
    }
    return true;
  }

  private recordFailure(): void {
    this.failureCount += 1;
    if (this.failureCount >= 3 && this.circuitOpenedAt === null) {
      this.circuitOpenedAt = Date.now();
    }
  }

  private resetCircuit(): void {
    this.failureCount = 0;
    this.circuitOpenedAt = null;
  }
}
