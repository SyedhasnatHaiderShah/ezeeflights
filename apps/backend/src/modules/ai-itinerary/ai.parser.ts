import { BadRequestException, Injectable } from '@nestjs/common';
import { z } from 'zod';

const aiOutputSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  duration_days: z.number().int().min(1).max(30),
  itinerary: z.array(z.object({
    day: z.number().int().min(1),
    title: z.string().min(2),
    activities: z.array(z.string().min(2)).min(1),
    hotel_suggestion: z.string().min(2),
  })).min(1),
  pricing: z.object({
    estimated_total: z.number().nonnegative(),
    breakdown: z.object({
      hotel: z.number().nonnegative(),
      activities: z.number().nonnegative(),
      transfers: z.number().nonnegative(),
      margin: z.number().nonnegative(),
    }),
  }),
  inclusions: z.array(z.string().min(2)).min(1),
  exclusions: z.array(z.string().min(2)).default([]),
});

export type ParsedAiOutput = z.infer<typeof aiOutputSchema>;

@Injectable()
export class AiParser {
  parseStrict(raw: string): ParsedAiOutput {
    if (!raw.trim()) {
      throw new BadRequestException('Empty AI response');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadRequestException('Invalid AI JSON response');
    }

    const result = aiOutputSchema.safeParse(parsed);
    if (!result.success) {
      throw new BadRequestException(`AI JSON schema validation failed: ${result.error.issues.map((i) => i.path.join('.')).join(', ')}`);
    }

    return this.normalize(result.data);
  }

  normalize(data: ParsedAiOutput): ParsedAiOutput {
    const itinerary = [...data.itinerary]
      .sort((a, b) => a.day - b.day)
      .map((row) => ({
        ...row,
        activities: row.activities.map((a) => a.trim()).filter(Boolean),
      }));

    return {
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      itinerary,
      inclusions: data.inclusions.map((v) => v.trim()).filter(Boolean),
      exclusions: data.exclusions.map((v) => v.trim()).filter(Boolean),
    };
  }
}
