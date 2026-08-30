import { Injectable, Logger } from '@nestjs/common';
import { HybridCacheService } from '../../hybrid-engine/cache.service';
import { GeminiService } from './gemini.service';
import { OpenaiService } from './openai.service';

const INSIGHTS_CACHE_TTL_SEC = 60 * 60 * 24; // 24 hours

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly cache: HybridCacheService,
    private readonly geminiService: GeminiService,
    private readonly openaiService: OpenaiService,
  ) {}
  naturalLanguageSearch(prompt: string) {
    return {
      prompt,
      interpretedIntent: 'flight_search',
      filters: {
        origin: 'DXB',
        destination: 'LHR',
        date: new Date().toISOString().slice(0, 10),
      },
      provider: process.env.OPENAI_API_KEY ? 'openai-configured' : 'mock',
    };
  }

  pricePrediction(route: string) {
    return {
      route,
      trend: 'stable',
      confidence: 0.73,
      recommendation: 'Book within 3 days for best fare window',
    };
  }

  assistant(prompt: string) {
    return {
      answer: `I can help plan your trip. You asked: ${prompt}`,
      nextActions: ['search_flights', 'search_hotels', 'build_itinerary'],
    };
  }

  async getDestinationInsights(destination: string): Promise<Record<string, unknown> | null> {
    const code = destination.trim().toUpperCase();
    if (!code) return null;

    const cacheKey = `ai:destination-insights:${code}`;
    const cached = await this.cache.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      this.logger.debug({ destination: code }, 'Destination insights cache hit');
      return cached;
    }

    // OpenAI is preferred; Gemini is fallback
    this.logger.log(`Fetching destination insights for ${code} via OpenAI...`);
    const startTime = Date.now();
    let data = await this.openaiService.getDestinationInsights(code);
    if (data) {
      this.logger.log(`OpenAI successfully generated destination insights for ${code} in ${Date.now() - startTime}ms`);
    } else {
      this.logger.warn(`OpenAI failed for ${code}. Falling back to Gemini...`);
      const geminiStart = Date.now();
      data = await this.geminiService.getDestinationInsights(code);
      if (data) {
        this.logger.log(`Gemini successfully generated destination insights for ${code} in ${Date.now() - geminiStart}ms`);
      } else {
        this.logger.error(`Both OpenAI and Gemini failed to generate destination insights for ${code}`);
      }
    }

    if (data) {
      await this.cache.set(cacheKey, data, INSIGHTS_CACHE_TTL_SEC);
    }

    return data;
  }

  async getCityInsights(
    city: string,
    slug?: string,
  ): Promise<Record<string, unknown> | null> {
    const cityName = city.trim();
    const cacheKey = `ai:city-insights:${(slug || cityName).trim().toLowerCase().replace(/\s+/g, "-")}`;
    if (!cityName) return null;

    const cached = await this.cache.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      this.logger.debug({ city: cityName }, "City insights cache hit");
      return cached;
    }

    // OpenAI is preferred; Gemini is fallback
    this.logger.log(`Fetching city insights for ${cityName} via OpenAI...`);
    const startTime = Date.now();
    let data = await this.openaiService.getCityInsights(cityName);
    if (data) {
      this.logger.log(`OpenAI successfully generated city insights for ${cityName} in ${Date.now() - startTime}ms`);
    } else {
      this.logger.warn(`OpenAI failed for ${cityName}. Falling back to Gemini...`);
      const geminiStart = Date.now();
      data = await this.geminiService.getCityInsights(cityName);
      if (data) {
        this.logger.log(`Gemini successfully generated city insights for ${cityName} in ${Date.now() - geminiStart}ms`);
      } else {
        this.logger.error(`Both OpenAI and Gemini failed to generate city insights for ${cityName}`);
      }
    }

    if (data) {
      await this.cache.set(cacheKey, data, INSIGHTS_CACHE_TTL_SEC);
    }

    return data;
  }
}
