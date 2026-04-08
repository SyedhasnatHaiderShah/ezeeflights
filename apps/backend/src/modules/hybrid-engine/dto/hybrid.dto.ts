import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class HybridTravelDatesDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export class HybridGeneratePackageDto {
  @IsString()
  destination!: string;

  @ValidateNested()
  @Type(() => HybridTravelDatesDto)
  travelDates!: HybridTravelDatesDto;

  @IsInt()
  @Min(1)
  travelers!: number;

  @IsNumber()
  @Min(0)
  budget!: number;

  @IsArray()
  @IsString({ each: true })
  preferences!: string[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class PricingRecalculateDto {
  @IsNumber()
  @Min(0)
  flightPrice!: number;

  @IsNumber()
  @Min(0)
  hotelPrice!: number;

  @IsNumber()
  @Min(0)
  activitiesCost!: number;

  @IsString()
  @IsOptional()
  baseCurrency?: string;

  @IsString()
  @IsOptional()
  targetCurrency?: string;

  @IsOptional()
  @IsIn(['budget', 'standard', 'luxury'])
  packageTier?: 'budget' | 'standard' | 'luxury';

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPct?: number;
}
