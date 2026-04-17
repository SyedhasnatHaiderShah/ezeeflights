import { Injectable } from '@nestjs/common';
import { CircuitBreakerService } from '../../../common/circuit-breaker/circuit-breaker.service';

@Injectable()
export class AiService {
  constructor(private readonly circuitBreaker: CircuitBreakerService) {}

  async naturalLanguageSearch(prompt: string) {
    return this.circuitBreaker.execute(
      'openai',
      async () => ({
        prompt,
        interpretedIntent: 'flight_search',
        filters: {
          origin: 'DXB',
          destination: 'LHR',
          date: new Date().toISOString().slice(0, 10),
        },
        provider: process.env.OPENAI_API_KEY ? 'openai-configured' : 'mock',
      }),
      async () => ({
        prompt,
        interpretedIntent: 'flight_search',
        filters: {},
        provider: 'fallback',
      }),
    );
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
}
