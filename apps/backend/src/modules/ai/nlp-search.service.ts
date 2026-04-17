import { Injectable, Logger } from '@nestjs/common';
import { FlightService } from '../flight/services/flight.service';
import { HotelService } from '../hotel/services/hotel.service';
import { PostgresClient } from '../../database/postgres.client';

export interface ParsedSearchIntent {
  type: 'flight' | 'hotel' | 'package' | 'car';
  origin: string | null;
  destination: string | null;
  departureDate: string | null;
  returnDate: string | null;
  adults: number;
  children: number;
  cabinClass: 'economy' | 'business' | 'first' | null;
  budget: number | null;
  currency: 'USD';
  hotelStars: number | null;
  nights: number | null;
  preferences: string[];
}

@Injectable()
export class NlpSearchService {
  private readonly logger = new Logger(NlpSearchService.name);

  constructor(
    private readonly flightService: FlightService,
    private readonly hotelService: HotelService,
    private readonly db: PostgresClient,
  ) {}

  async parseNaturalLanguageQuery(query: string, userId?: string): Promise<ParsedSearchIntent> {
    const systemPrompt = `You are a travel booking assistant. Parse the user's natural language travel request
and return ONLY a valid JSON object with these fields (use null for missing fields):
{
  "type": "flight|hotel|package|car",
  "origin": "IATA code or city",
  "destination": "IATA code or city",
  "departureDate": "YYYY-MM-DD or null",
  "returnDate": "YYYY-MM-DD or null",
  "adults": number,
  "children": number,
  "cabinClass": "economy|business|first or null",
  "budget": number or null,
  "currency": "USD",
  "hotelStars": number or null,
  "nights": number or null,
  "preferences": []
}`;

    const fallback: ParsedSearchIntent = {
      type: /hotel|stay|resort|room/i.test(query) ? 'hotel' : 'flight',
      origin: null,
      destination: null,
      departureDate: null,
      returnDate: null,
      adults: 1,
      children: 0,
      cabinClass: null,
      budget: null,
      currency: 'USD',
      hotelStars: null,
      nights: null,
      preferences: [],
    };

    const parsed = await this.callOpenAiIntentParser(systemPrompt, query, fallback);
    const intent = { ...fallback, ...parsed };

    await this.logSearch(query, intent, 0, userId);
    return intent;
  }

  async searchFromIntent(intent: ParsedSearchIntent): Promise<unknown[]> {
    if (intent.type === 'hotel' && intent.destination) {
      return this.hotelService.search({
        city: intent.destination,
        minStars: intent.hotelStars ?? undefined,
        page: 1,
        limit: 10,
      });
    }

    if (intent.origin && intent.destination && intent.departureDate) {
      const cabinMap: Record<string, 'ECONOMY' | 'BUSINESS' | 'FIRST'> = {
        economy: 'ECONOMY',
        business: 'BUSINESS',
        first: 'FIRST',
      };
      return this.flightService.searchFlights({
        origin: intent.origin,
        destination: intent.destination,
        departureDate: intent.departureDate,
        cabinClass: intent.cabinClass ? cabinMap[intent.cabinClass] : undefined,
        currency: 'USD',
        page: 1,
        limit: 10,
      });
    }

    return [];
  }

  private async callOpenAiIntentParser(
    systemPrompt: string,
    query: string,
    fallback: ParsedSearchIntent,
  ): Promise<Partial<ParsedSearchIntent>> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return fallback;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
        }),
      });

      if (!response.ok) {
        this.logger.warn(`OpenAI NLP parser failed with ${response.status}`);
        return fallback;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        return fallback;
      }

      return JSON.parse(content) as Partial<ParsedSearchIntent>;
    } catch (error) {
      this.logger.warn(`NLP parser fallback used: ${(error as Error).message}`);
      return fallback;
    }
  }

  private async logSearch(queryText: string, parsedIntent: ParsedSearchIntent, resultsCount: number, userId?: string) {
    await this.db.query(
      `INSERT INTO ai_search_logs (user_id, query_text, parsed_intent, results_count)
       VALUES ($1, $2, $3::jsonb, $4)`,
      [userId ?? null, queryText, JSON.stringify(parsedIntent), resultsCount],
    );
  }
}
