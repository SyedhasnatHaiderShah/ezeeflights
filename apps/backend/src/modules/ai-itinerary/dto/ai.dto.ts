import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export const aiTravelerTypeValues = ['solo', 'family', 'couple', 'business'] as const;
export const aiPreferenceValues = ['luxury', 'adventure', 'cultural', 'relaxation'] as const;
export const aiGeneratedStatusValues = ['draft', 'reviewed', 'published', 'rejected'] as const;

export class AiGeneratePackageDto {
  @IsString()
  destination!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsInt() @Min(1) @Max(30)
  durationDays!: number;

  @IsNumber() @Min(0)
  budgetMin!: number;

  @IsNumber() @Min(0)
  budgetMax!: number;

  @IsEnum(aiTravelerTypeValues)
  travelerType!: (typeof aiTravelerTypeValues)[number];

  @IsArray() @IsEnum(aiPreferenceValues, { each: true })
  preferences!: Array<(typeof aiPreferenceValues)[number]>;

  @IsOptional() @IsUUID()
  userId?: string;

  @IsOptional() @IsObject()
  context?: Record<string, unknown>;
}

export class AiReviewDto {
  @IsOptional() @IsString()
  reviewerNotes?: string;
}

export class AiConvertPackageDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  status?: 'draft' | 'published';

  @IsOptional() @ValidateNested({ each: true }) @Type(() => AiItineraryItemOverrideDto)
  itineraryOverrides?: AiItineraryItemOverrideDto[];
}

export class AiItineraryItemOverrideDto {
  @IsInt() @Min(1)
  day!: number;

  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  activities?: string[];

  @IsOptional() @IsString()
  hotelSuggestion?: string;
}
