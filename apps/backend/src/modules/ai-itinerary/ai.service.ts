import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { NotificationService } from '../notification/services/notification.service';
import { ItineraryService } from '../packages/itinerary.service';
import { CreatePackageDto, UpsertItineraryDto } from '../packages/dto/package.dto';
import { PackageService } from '../packages/package.service';
import { AiParser } from './ai.parser';
import { AiPromptBuilder } from './ai.prompt.builder';
import { AiRepository } from './ai.repository';
import { AiConvertPackageDto, AiGeneratePackageDto } from './dto/ai.dto';

@Injectable()
export class AiItineraryService {
  private readonly maxRetries = 2;

  constructor(
    private readonly promptBuilder: AiPromptBuilder,
    private readonly parser: AiParser,
    private readonly repository: AiRepository,
    private readonly packageService: PackageService,
    private readonly itineraryService: ItineraryService,
    private readonly notificationService: NotificationService,
  ) {}

  async generatePackage(createdBy: string, dto: AiGeneratePackageDto) {
    const personalization = dto.userId ? await this.repository.getUserBehaviorProfile(dto.userId) : null;
    const prompt = this.promptBuilder.buildGeneratePrompt(dto, personalization ?? undefined);

    const started = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      try {
        const response = await this.callModel(prompt);
        const parsed = this.parser.parseStrict(response.content);
        const enriched = await this.enrichWithHotelAndPricing(dto.destination, parsed);

        await this.repository.createGenerationLog({
          requestPayload: prompt.user as Record<string, unknown>,
          responsePayload: enriched as unknown as Record<string, unknown>,
          status: 'success',
          provider: response.provider,
          model: response.model,
          tokensUsed: response.tokensUsed,
          latencyMs: Date.now() - started,
          estimatedCost: this.estimateCost(response.tokensUsed ?? 0),
        });

        const saved = await this.repository.createGeneratedPackage(prompt.user as Record<string, unknown>, enriched as unknown as Record<string, unknown>, createdBy);
        return { ...saved, model: response.model, attempts: attempt + 1 };
      } catch (error) {
        lastError = error as Error;
        if (attempt >= this.maxRetries) {
          break;
        }
      }
    }

    await this.repository.createGenerationLog({
      requestPayload: prompt.user as Record<string, unknown>,
      status: 'failed',
      provider: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
      latencyMs: Date.now() - started,
      errorMessage: lastError?.message ?? 'Unknown AI generation error',
    });

    throw new ServiceUnavailableException(`AI generation failed after retries: ${lastError?.message ?? 'Unknown error'}`);
  }

  list() {
    return this.repository.listGeneratedPackages();
  }

  getById(id: string) {
    return this.repository.getGeneratedPackageById(id);
  }

  approve(id: string, notes?: string) {
    return this.repository.updateGeneratedStatus(id, 'reviewed', notes);
  }

  reject(id: string, notes?: string) {
    return this.repository.updateGeneratedStatus(id, 'rejected', notes);
  }

  async convert(id: string, adminId: string, dto: AiConvertPackageDto = {}) {
    const generated = await this.repository.getGeneratedPackageById(id);
    if (generated.status === 'rejected') {
      throw new BadRequestException('Rejected AI package cannot be converted');
    }

    const output = generated.generatedOutput as any;
    const normalizedItinerary = this.applyItineraryOverrides(output.itinerary ?? [], dto.itineraryOverrides ?? []);

    const createPayload: CreatePackageDto = {
      title: dto.title ?? output.title,
      description: dto.description ?? output.description,
      destination: String((generated.inputPayload as any).destination ?? 'Unknown'),
      country: String((generated.inputPayload as any).country ?? 'Unknown'),
      durationDays: Number(output.duration_days),
      basePrice: Number(output.pricing?.estimated_total ?? 0),
      currency: 'USD',
      thumbnailUrl: undefined,
      status: dto.status ?? 'draft',
      pricing: this.toPackagePricing(output.pricing?.breakdown ?? {}),
      inclusions: (output.inclusions ?? []).map((description: string) => ({ type: this.mapInclusionType(description), description })),
      exclusions: output.exclusions ?? [],
    };

    const pkg = await this.packageService.create(adminId, createPayload);
    for (const day of normalizedItinerary) {
      const itineraryPayload: UpsertItineraryDto = {
        dayNumber: Number(day.day),
        title: String(day.title),
        description: String((day.activities ?? []).join(', ')),
      };
      await this.itineraryService.create(pkg.id, itineraryPayload);
    }

    await this.repository.setPackageAiFlag(pkg.id, true);
    await this.repository.markConverted(id, pkg.id);

    if ((dto.status ?? 'draft') === 'published') {
      await this.notificationService.triggerBookingConfirmed(adminId, {
        module: 'PACKAGE_AI',
        packageId: pkg.id,
        message: `AI generated package published: ${pkg.title}`,
      });
    }

    return this.packageService.getById(pkg.id);
  }

  estimatePricing(hotelTotal: number, activitiesTotal: number) {
    const transfers = Number((hotelTotal * 0.08).toFixed(2));
    const margin = Number(((hotelTotal + activitiesTotal + transfers) * 0.12).toFixed(2));
    const estimatedTotal = Number((hotelTotal + activitiesTotal + transfers + margin).toFixed(2));
    return { estimated_total: estimatedTotal, breakdown: { hotel: hotelTotal, activities: activitiesTotal, transfers, margin } };
  }

  private async enrichWithHotelAndPricing(destination: string, data: any) {
    const hotels = await this.repository.findHotelSuggestions(destination, 1);
    const hotelRate = hotels[0]?.nightlyRate ?? 120;

    const itinerary = data.itinerary.map((day: any) => ({
      ...day,
      hotel_suggestion: day.hotel_suggestion || hotels[0]?.name || 'Curated 4-star hotel',
    }));

    const activitiesTotal = itinerary.reduce((acc: number, day: any) => acc + (day.activities?.length ?? 0) * 25, 0);
    const hotelTotal = Number((hotelRate * data.duration_days).toFixed(2));

    return {
      ...data,
      itinerary,
      pricing: this.estimatePricing(hotelTotal, activitiesTotal),
    };
  }

  private async callModel(prompt: { system: string; user: unknown }): Promise<{ content: string; tokensUsed?: number; provider: string; model: string }> {
    if (!process.env.OPENAI_API_KEY) {
      const mockJson = JSON.stringify({
        title: `AI Escape to ${(prompt.user as any).destination}`,
        description: `A curated ${(prompt.user as any).duration_days ?? 5}-day trip blending comfort and discovery.`,
        duration_days: Number((prompt.user as any).travel_dates?.duration_days ?? 5),
        itinerary: Array.from({ length: Number((prompt.user as any).travel_dates?.duration_days ?? 5) }).map((_, idx) => ({
          day: idx + 1,
          title: `Day ${idx + 1} Highlights`,
          activities: ['City walk', 'Local cuisine tasting', 'Transfer support'],
          hotel_suggestion: '',
        })),
        pricing: { estimated_total: 0, breakdown: { hotel: 0, activities: 0, transfers: 0, margin: 0 } },
        inclusions: ['Hotel stay', 'Airport transfer', 'Daily breakfast'],
        exclusions: ['Visa fees', 'Personal expenses'],
      });

      return { content: mockJson, tokensUsed: 350, provider: 'mock', model: 'mock-itinerary-v1' };
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_ITINERARY_MODEL ?? 'gpt-4.1-mini',
        input: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: JSON.stringify(prompt.user) },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException(`AI provider failure (${response.status})`);
    }

    const json = await response.json() as any;
    const content = json.output_text as string | undefined;
    if (!content) {
      throw new ServiceUnavailableException('AI provider returned empty content');
    }

    return {
      content,
      provider: 'openai',
      model: json.model ?? (process.env.AI_ITINERARY_MODEL ?? 'gpt-4.1-mini'),
      tokensUsed: Number(json.usage?.total_tokens ?? 0),
    };
  }

  private estimateCost(tokensUsed: number) {
    return Number(((tokensUsed / 1000) * 0.003).toFixed(6));
  }

  private toPackagePricing(breakdown: Record<string, number>) {
    const total = Number(breakdown.hotel ?? 0) + Number(breakdown.activities ?? 0) + Number(breakdown.transfers ?? 0) + Number(breakdown.margin ?? 0);
    return {
      adultPrice: Number(total.toFixed(2)),
      childPrice: Number((total * 0.7).toFixed(2)),
      infantPrice: Number((total * 0.2).toFixed(2)),
    };
  }

  private applyItineraryOverrides(itinerary: Array<any>, overrides: Array<{ day: number; title?: string; activities?: string[]; hotelSuggestion?: string }>) {
    const map = new Map(overrides.map((row) => [row.day, row]));
    return itinerary.map((day) => {
      const override = map.get(day.day);
      if (!override) return day;
      return {
        ...day,
        title: override.title ?? day.title,
        activities: override.activities ?? day.activities,
        hotel_suggestion: override.hotelSuggestion ?? day.hotel_suggestion,
      };
    });
  }

  private mapInclusionType(value: string): 'flight' | 'hotel' | 'meal' | 'activity' | 'transfer' {
    const v = value.toLowerCase();
    if (v.includes('flight')) return 'flight';
    if (v.includes('hotel')) return 'hotel';
    if (v.includes('meal') || v.includes('breakfast')) return 'meal';
    if (v.includes('transfer')) return 'transfer';
    return 'activity';
  }
}
