import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { z } from 'zod';
import { PaymentProvider } from '../../payment/entities/payment.entity';

export const packageStatusValues = ['draft', 'published', 'archived'] as const;
export type PackageStatus = (typeof packageStatusValues)[number];

export const inclusionTypeValues = ['flight', 'hotel', 'meal', 'activity', 'transfer'] as const;
export type InclusionType = (typeof inclusionTypeValues)[number];

export class PackagePricingDto {
  @ApiProperty({ example: 299, description: 'Adult price (USD)', minimum: 0 })
  @IsNumber() @Min(0)
  adultPrice!: number;

  @ApiProperty({ example: 199, description: 'Child price (USD)', minimum: 0 })
  @IsNumber() @Min(0)
  childPrice!: number;

  @ApiProperty({ example: 0, description: 'Infant price (USD)', minimum: 0 })
  @IsNumber() @Min(0)
  infantPrice!: number;
}

export class PackageInclusionDto {
  @ApiProperty({ enum: inclusionTypeValues, description: 'Inclusion type' })
  @IsEnum(inclusionTypeValues)
  type!: InclusionType;

  @ApiProperty({ example: 'Return flights included', description: 'Inclusion description' })
  @IsString()
  description!: string;
}

export class CreatePackageDto {
  @ApiProperty({ example: 'Paris Romantic Getaway', description: 'Package title' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'A romantic escape to the city of lights', description: 'Package description' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Paris', description: 'Destination city or region' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: 'France', description: 'Destination country' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 7, description: 'Trip duration in days', minimum: 1, maximum: 60 })
  @IsInt() @Min(1) @Max(60)
  durationDays!: number;

  @ApiProperty({ example: 1499, description: 'Base price per person (USD)', minimum: 0 })
  @IsNumber() @Min(0)
  basePrice!: number;

  @ApiProperty({ enum: ['USD', 'AED', 'EUR', 'GBP'], description: 'Pricing currency' })
  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @ApiPropertyOptional({ example: 'https://cdn.example.com/paris.jpg', description: 'Thumbnail image URL' })
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: packageStatusValues, description: 'Package status' })
  @IsOptional() @IsEnum(packageStatusValues)
  status?: PackageStatus;

  @ApiProperty({ type: () => PackagePricingDto, description: 'Per-traveler-type pricing' })
  @ValidateNested() @Type(() => PackagePricingDto)
  pricing!: PackagePricingDto;

  @ApiProperty({ type: [PackageInclusionDto], description: 'List of inclusions' })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PackageInclusionDto)
  inclusions!: PackageInclusionDto[];

  @ApiProperty({ type: [String], example: ['Visa fees', 'Travel insurance'], description: 'List of exclusions' })
  @IsArray() @IsString({ each: true })
  exclusions!: string[];
}

export class UpdatePackageDto {
  @ApiPropertyOptional({ example: 'Paris Romantic Getaway', description: 'Package title' })
  @IsOptional() @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'A romantic escape to the city of lights', description: 'Package description' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Paris', description: 'Destination city or region' })
  @IsOptional() @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: 'France', description: 'Destination country' })
  @IsOptional() @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 7, description: 'Trip duration in days', minimum: 1, maximum: 60 })
  @IsOptional() @IsInt() @Min(1) @Max(60)
  durationDays?: number;

  @ApiPropertyOptional({ example: 1499, description: 'Base price per person (USD)', minimum: 0 })
  @IsOptional() @IsNumber() @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ enum: ['USD', 'AED', 'EUR', 'GBP'], description: 'Pricing currency' })
  @IsOptional() @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency?: 'USD' | 'AED' | 'EUR' | 'GBP';

  @ApiPropertyOptional({ example: 'https://cdn.example.com/paris.jpg', description: 'Thumbnail image URL' })
  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: packageStatusValues, description: 'Package status' })
  @IsOptional() @IsEnum(packageStatusValues)
  status?: PackageStatus;

  @ApiPropertyOptional({ type: () => PackagePricingDto, description: 'Per-traveler-type pricing' })
  @IsOptional() @ValidateNested() @Type(() => PackagePricingDto)
  pricing?: PackagePricingDto;

  @ApiPropertyOptional({ type: [PackageInclusionDto], description: 'List of inclusions' })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PackageInclusionDto)
  inclusions?: PackageInclusionDto[];

  @ApiPropertyOptional({ type: [String], example: ['Visa fees'], description: 'List of exclusions' })
  @IsOptional() @IsArray() @IsString({ each: true })
  exclusions?: string[];
}

export class UpsertItineraryDto {
  @ApiProperty({ example: 1, description: 'Day number in the itinerary', minimum: 1 })
  @IsInt() @Min(1)
  dayNumber!: number;

  @ApiProperty({ example: 'Arrival & Eiffel Tower', description: 'Day title' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Arrive at CDG, check in, evening at the Eiffel Tower', description: 'Day description' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Hotel UUID for this day' })
  @IsOptional() @IsUUID()
  hotelId?: string;
}

export class CreatePackageBookingDto {
  @ApiProperty({ type: [Object], example: [{ type: 'adult', fullName: 'John Doe' }], description: 'Travelers list' })
  @IsArray()
  travelers!: Array<{ type: 'adult' | 'child' | 'infant'; fullName: string; age?: number }>;

  @ApiProperty({ enum: ['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'], description: 'Payment provider' })
  @IsEnum(['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'])
  paymentProvider!: PaymentProvider;

  @ApiProperty({ example: 'https://yoursite.com/success', description: 'Redirect URL on payment success' })
  @IsString()
  successUrl!: string;

  @ApiProperty({ example: 'https://yoursite.com/failure', description: 'Redirect URL on payment failure' })
  @IsString()
  failureUrl!: string;
}

export const packageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  status: z.enum(packageStatusValues).optional(),
  destination: z.string().trim().optional(),
});

export type PackageQueryDto = z.infer<typeof packageQuerySchema>;
