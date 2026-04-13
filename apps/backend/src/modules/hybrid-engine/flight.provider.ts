import { Injectable, Logger } from '@nestjs/common';
import { AmadeusProvider } from '../../common/providers';
import { HybridCacheService } from './cache.service';
import { NormalizedFlightOption } from './types/hybrid.types';

@Injectable()
export class FlightProviderService {
  private readonly logger = new Logger(FlightProviderService.name);
  private circuitOpenedAt: number | null = null;
  private failureCount = 0;

  constructor(
    private readonly cache: HybridCacheService,
    private readonly amadeusProvider: AmadeusProvider,
  ) {}

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

    const amadeusRows = await this.fetchAmadeusFlights(params);
    if (amadeusRows.length > 0) {
      await this.cache.set(cacheKey, amadeusRows, 600);
      return amadeusRows;
    }

    return this.fallbackFlights(params);
  }

  private async fetchAmadeusFlights(params: { origin: string; destination: string; date: string; travelers: number; currency?: string }): Promise<NormalizedFlightOption[]> {
    if (this.isCircuitOpen()) {
      this.logger.warn('Circuit open for amadeus flight API; skipping requests.');
      return [];
    }

    try {
      const result = await this.requestWithRetry(async () => {
        return this.amadeusProvider.searchFlights(params);
      });

      this.resetCircuit();
      return this.normalize('amadeus', result);
    } catch (error) {
      this.recordFailure();
      this.logger.warn(`Flight provider amadeus failed: ${(error as Error).message}`);
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
