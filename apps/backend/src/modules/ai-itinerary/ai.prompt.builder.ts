import { Injectable } from '@nestjs/common';
import { AiGeneratePackageDto } from './dto/ai.dto';
import { AI_PACKAGE_JSON_SCHEMA_TEMPLATE, AI_PACKAGE_SYSTEM_PROMPT_TEMPLATE } from './prompts';

@Injectable()
export class AiPromptBuilder {
  buildGeneratePrompt(input: AiGeneratePackageDto, personalization?: Record<string, unknown>) {
    const system = `${AI_PACKAGE_SYSTEM_PROMPT_TEMPLATE} Currency must be USD. pricing.breakdown must include hotel, activities, transfers, margin.`;

    const user = {
      destination: input.destination,
      country: input.country ?? null,
      travel_dates: { start_date: input.startDate ?? null, end_date: input.endDate ?? null, duration_days: input.durationDays },
      budget_range: { min: input.budgetMin, max: input.budgetMax, currency: 'USD' },
      traveler_type: input.travelerType,
      preferences: input.preferences,
      personalization: personalization ?? null,
      output_schema: AI_PACKAGE_JSON_SCHEMA_TEMPLATE,
    };

    return { system, user };
  }
}
