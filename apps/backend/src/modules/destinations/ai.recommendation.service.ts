import { Injectable } from '@nestjs/common';
import { AiTopAttractionsDto } from './dto/destination.dto';
import { DestinationRepository } from './destination.repository';
import { buildTopAttractionsPrompt, DESTINATION_RECOMMENDATION_SYSTEM_PROMPT } from './ai.prompt.templates';

@Injectable()
export class AiRecommendationService {
  constructor(private readonly repository: DestinationRepository) {}

  async rankForUser(userId: string, citySlug: string) {
    const [context, attractions] = await Promise.all([
      this.repository.listUserContext(userId),
      this.repository.listAttractions({ city: citySlug, page: 1, limit: 100 }),
    ]);

    const prefInterests = this.normalizeInterests(context.preferences);
    const wishlistCategories = new Set(context.wishlistCategories.map((v) => String(v).toLowerCase()));

    const scored = attractions.data.map((item) => {
      const categoryBoost = prefInterests.includes(item.category) ? 0.4 : wishlistCategories.has(item.category) ? 0.25 : 0;
      const popularity = Math.min(1, item.rating / 5) * 0.35 + Math.min(1, item.totalReviews / 1000) * 0.1;
      const recencySignal = context.pastDestinations.some((d) => String(d).toLowerCase().includes(citySlug.toLowerCase())) ? -0.05 : 0.05;
      const score = Number((categoryBoost + popularity + recencySignal).toFixed(4));
      return { ...item, score };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  async topFive(dto: AiTopAttractionsDto) {
    const ranked = await this.repository.listAttractions({ city: dto.city, page: 1, limit: 30 });
    const prompt = buildTopAttractionsPrompt({ city: dto.city, travelerType: dto.travelerType, interests: dto.interests, attractions: ranked.data.map((a) => ({ name: a.name, category: a.category, rating: a.rating })) });

    if (!process.env.OPENAI_API_KEY) {
      return {
        top_5: ranked.data.slice(0, 5).map((a) => ({ name: a.name, reason: `${a.category} pick with strong ratings for ${dto.travelerType} travelers`, best_time: 'Morning' })),
      };
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_RECOMMENDATION_MODEL ?? 'gpt-4.1-mini',
        input: [
          { role: 'system', content: DESTINATION_RECOMMENDATION_SYSTEM_PROMPT + ' Return strict JSON: {"top_5":[{"name":"","reason":"","best_time":""}]}' },
          { role: 'user', content: JSON.stringify(prompt) },
        ],
      }),
    });

    if (!response.ok) {
      return { top_5: [] };
    }

    const json = (await response.json()) as any;
    try {
      return JSON.parse(json.output_text ?? '{"top_5":[]}');
    } catch {
      return { top_5: [] };
    }
  }

  private normalizeInterests(preferences: Record<string, unknown>): string[] {
    const interests = preferences.interests;
    if (Array.isArray(interests)) {
      return interests.map((v) => String(v).toLowerCase());
    }
    return [];
  }

}
