import { Injectable, Logger } from '@nestjs/common';
import { HybridCacheService } from './cache.service';
import { NormalizedFlightOption } from './types/hybrid.types';

@Injectable()
export class FlightProviderService {
  private readonly logger = new Logger(FlightProviderService.name);
  private circuitOpenedAt: number | null = null;
  private failureCount = 0;

  constructor(private readonly cache: HybridCacheService) {}

  async getFlights(params: {
    origin: string;
    destination: string;
    date: string;
    travelers: number;
    currency?: string;
  }): Promise<NormalizedFlightOption[]> {
    const cacheKey = `flight:${params.origin}:${params.destination}:${params.date}`;
    const cached = await this.cache.get<NormalizedFlightOption[]>(cacheKey);
    if (cached) return cached;

    const providers = [
      { name: 'amadeus', key: process.env.AMADEUS_API_KEY, baseUrl: process.env.AMADEUS_BASE_URL },
      { name: 'duffel', key: process.env.DUFFEL_API_KEY, baseUrl: process.env.DUFFEL_BASE_URL },
      { name: 'skyscanner', key: process.env.SKYSCANNER_API_KEY, baseUrl: process.env.SKYSCANNER_BASE_URL },
    ];

    for (const provider of providers) {
      const rows = await this.fetchProviderFlights(provider.name, provider.baseUrl, provider.key, params);
      if (rows.length > 0) {
        await this.cache.set(cacheKey, rows, 600);
        return rows;
      }
    }

    return this.fallbackFlights(params);
  }

  private async fetchProviderFlights(
    provider: string,
    baseUrl: string | undefined,
    apiKey: string | undefined,
    params: { origin: string; destination: string; date: string; travelers: number; currency?: string },
  ): Promise<NormalizedFlightOption[]> {
    if (!baseUrl || !apiKey) {
      return [];
    }

    if (this.isCircuitOpen()) {
      this.logger.warn(`Circuit open for ${provider} flight API; skipping requests.`);
      return [];
    }

    try {
      const result = await this.requestWithRetry(async () => {
        const response = await fetch(`${baseUrl}/flights/search`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Provider ${provider} failed (${response.status})`);
        }

        return response.json() as Promise<any>;
      });

      this.resetCircuit();
      return this.normalize(provider, result);
    } catch (error) {
      this.recordFailure();
      this.logger.warn(`Flight provider ${provider} failed: ${(error as Error).message}`);
      return [];
    }
  }

  normalize(provider: string, payload: any): NormalizedFlightOption[] {
    const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
    return rows.map((row: any, idx: number) => ({
      provider,
      id: String(row.id ?? `${provider}-${idx}`),
      airline: String(row.airline ?? row.carrier ?? 'Unknown Airline'),
      departure: String(row.departure ?? row.departureTime ?? row.outbound?.departure ?? ''),
      arrival: String(row.arrival ?? row.arrivalTime ?? row.outbound?.arrival ?? ''),
      durationMinutes: Number(row.durationMinutes ?? row.duration ?? 0),
      price: Number(row.price?.amount ?? row.amount ?? row.price ?? 0),
      currency: String(row.price?.currency ?? row.currency ?? 'USD'),
    }));
  }

  private fallbackFlights(params: { origin: string; destination: string; date: string; travelers: number; currency?: string }): NormalizedFlightOption[] {
    return [
      {
        provider: 'ai-estimate',
        id: 'fallback-flight-1',
        airline: 'Estimated Air',
        departure: `${params.date}T08:00:00Z`,
        arrival: `${params.date}T12:00:00Z`,
        durationMinutes: 240,
        price: 420 * params.travelers,
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
