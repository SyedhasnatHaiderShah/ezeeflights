import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
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
}
