import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';

export const aiTravelerTypeValues = ['solo', 'family', 'couple', 'business'] as const;
export const aiPreferenceValues = ['luxury', 'adventure', 'cultural', 'relaxation'] as const;
export const aiGeneratedStatusValues = ['draft', 'reviewed', 'published', 'rejected'] as const;

export class AiGeneratePackageDto {
  @ApiProperty({ example: 'Paris', description: 'Destination city or region' })
  @IsString()
  destination!: string;

  @ApiPropertyOptional({ example: 'France', description: 'Destination country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '2025-08-01', description: 'Preferred start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-08-08', description: 'Preferred end date' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ example: 7, description: 'Trip duration in days', minimum: 1, maximum: 30 })
  @IsInt() @Min(1) @Max(30)
  durationDays!: number;

  @ApiProperty({ example: 1000, description: 'Minimum budget (USD)', minimum: 0 })
  @IsNumber() @Min(0)
  budgetMin!: number;

  @ApiProperty({ example: 3000, description: 'Maximum budget (USD)', minimum: 0 })
  @IsNumber() @Min(0)
  budgetMax!: number;

  @ApiProperty({ enum: aiTravelerTypeValues, description: 'Traveler type' })
  @IsEnum(aiTravelerTypeValues)
  travelerType!: (typeof aiTravelerTypeValues)[number];

  @ApiProperty({ type: [String], enum: aiPreferenceValues, description: 'Travel preferences' })
  @IsArray() @IsEnum(aiPreferenceValues, { each: true })
  preferences!: Array<(typeof aiPreferenceValues)[number]>;

  @ApiPropertyOptional({ format: 'uuid', description: 'User UUID for personalisation' })
  @IsOptional() @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ type: 'object', description: 'Additional context for generation' })
  @IsOptional() @IsObject()
  context?: Record<string, unknown>;
}

export class AiReviewDto {
  @ApiPropertyOptional({ example: 'Looks good, minor pricing adjustment needed', description: 'Reviewer notes' })
  @IsOptional() @IsString()
  reviewerNotes?: string;
}

export class AiConvertPackageDto {
  @ApiPropertyOptional({ example: 'Paris Romantic Getaway', description: 'Override title' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'A romantic escape to the city of lights...', description: 'Override description' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published'], description: 'Publication status' })
  @IsOptional() @IsString()
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ type: [Object], description: 'Itinerary day overrides' })
  @IsOptional() @ValidateNested({ each: true }) @Type(() => AiItineraryItemOverrideDto)
  itineraryOverrides?: AiItineraryItemOverrideDto[];
}

export class AiItineraryItemOverrideDto {
  @ApiProperty({ example: 1, description: 'Day number to override', minimum: 1 })
  @IsInt() @Min(1)
  day!: number;

  @ApiPropertyOptional({ example: 'Arrival & Eiffel Tower', description: 'Override day title' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ type: [String], description: 'Override activities list' })
  @IsOptional() @IsArray() @IsString({ each: true })
  activities?: string[];

  @ApiPropertyOptional({ example: 'Hotel Le Marais', description: 'Override hotel suggestion' })
  @IsOptional() @IsString()
  hotelSuggestion?: string;
}
