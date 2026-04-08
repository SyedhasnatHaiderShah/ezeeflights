import { BadRequestException } from '@nestjs/common';
import { AiParser } from '../src/modules/ai-itinerary/ai.parser';

describe('AiParser', () => {
  const parser = new AiParser();

  it('parses valid JSON schema', () => {
    const payload = JSON.stringify({
      title: 'Bali Cultural Escape',
      description: 'A long enough description for schema validation in parser.',
      duration_days: 2,
      itinerary: [
        { day: 1, title: 'Arrival', activities: ['Transfer'], hotel_suggestion: 'Hotel One' },
        { day: 2, title: 'Tour', activities: ['Temple tour'], hotel_suggestion: 'Hotel One' },
      ],
      pricing: { estimated_total: 500, breakdown: { hotel: 200, activities: 150, transfers: 50, margin: 100 } },
      inclusions: ['Hotel'],
      exclusions: ['Flights'],
    });

    const out = parser.parseStrict(payload);
    expect(out.duration_days).toBe(2);
    expect(out.itinerary).toHaveLength(2);
  });

  it('throws on invalid JSON', () => {
    expect(() => parser.parseStrict('{bad-json')).toThrow(BadRequestException);
  });
});
