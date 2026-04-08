import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { z } from 'zod';
import { PaymentProvider } from '../../payment/entities/payment.entity';

export const packageStatusValues = ['draft', 'published', 'archived'] as const;
export type PackageStatus = (typeof packageStatusValues)[number];

export const inclusionTypeValues = ['flight', 'hotel', 'meal', 'activity', 'transfer'] as const;
export type InclusionType = (typeof inclusionTypeValues)[number];

export class PackagePricingDto {
  @IsNumber() @Min(0)
  adultPrice!: number;

  @IsNumber() @Min(0)
  childPrice!: number;

  @IsNumber() @Min(0)
  infantPrice!: number;
}

export class PackageInclusionDto {
  @IsEnum(inclusionTypeValues)
  type!: InclusionType;

  @IsString()
  description!: string;
}

export class CreatePackageDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  destination!: string;

  @IsString()
  country!: string;

  @IsInt() @Min(1) @Max(60)
  durationDays!: number;

  @IsNumber() @Min(0)
  basePrice!: number;

  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsEnum(packageStatusValues)
  status?: PackageStatus;

  @ValidateNested() @Type(() => PackagePricingDto)
  pricing!: PackagePricingDto;

  @IsArray() @ValidateNested({ each: true }) @Type(() => PackageInclusionDto)
  inclusions!: PackageInclusionDto[];

  @IsArray() @IsString({ each: true })
  exclusions!: string[];
}

export class UpdatePackageDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  destination?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsInt() @Min(1) @Max(60)
  durationDays?: number;

  @IsOptional() @IsNumber() @Min(0)
  basePrice?: number;

  @IsOptional() @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency?: 'USD' | 'AED' | 'EUR' | 'GBP';

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsOptional() @IsEnum(packageStatusValues)
  status?: PackageStatus;

  @IsOptional() @ValidateNested() @Type(() => PackagePricingDto)
  pricing?: PackagePricingDto;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PackageInclusionDto)
  inclusions?: PackageInclusionDto[];

  @IsOptional() @IsArray() @IsString({ each: true })
  exclusions?: string[];
}

export class UpsertItineraryDto {
  @IsInt() @Min(1)
  dayNumber!: number;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional() @IsUUID()
  hotelId?: string;
}

export class CreatePackageBookingDto {
  @IsArray()
  travelers!: Array<{ type: 'adult' | 'child' | 'infant'; fullName: string; age?: number }>;

  @IsEnum(['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'])
  paymentProvider!: PaymentProvider;

  @IsString()
  successUrl!: string;

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
