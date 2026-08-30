import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class HybridTravelDatesDto {
  @ApiProperty({ example: '2025-08-01', description: 'Travel start date (ISO date string)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-08-08', description: 'Travel end date (ISO date string)' })
  @IsDateString()
  endDate!: string;
}

export class HybridGeneratePackageDto {
  @ApiProperty({ example: 'Bali', description: 'Destination city or region' })
  @IsString()
  destination!: string;

  @ApiProperty({ type: () => HybridTravelDatesDto, description: 'Travel date range' })
  @ValidateNested()
  @Type(() => HybridTravelDatesDto)
  travelDates!: HybridTravelDatesDto;

  @ApiProperty({ example: 2, description: 'Number of travelers', minimum: 1 })
  @IsInt()
  @Min(1)
  travelers!: number;

  @ApiProperty({ example: 3000, description: 'Total budget (in specified currency)', minimum: 0 })
  @IsNumber()
  @Min(0)
  budget!: number;

  @ApiProperty({ type: [String], example: ['beach', 'culture'], description: 'Travel preferences' })
  @IsArray()
  @IsString({ each: true })
  preferences!: string[];

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'DXB', description: 'Origin city or airport code' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'User UUID for personalisation' })
  @IsOptional()
  @IsString()
  userId?: string;
}

export class PricingRecalculateDto {
  @ApiProperty({ example: 450, description: 'Flight cost component', minimum: 0 })
  @IsNumber()
  @Min(0)
  flightPrice!: number;

  @ApiProperty({ example: 800, description: 'Hotel cost component', minimum: 0 })
  @IsNumber()
  @Min(0)
  hotelPrice!: number;

  @ApiProperty({ example: 200, description: 'Activities cost component', minimum: 0 })
  @IsNumber()
  @Min(0)
  activitiesCost!: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Source currency code' })
  @IsString()
  @IsOptional()
  baseCurrency?: string;

  @ApiPropertyOptional({ example: 'AED', description: 'Target currency code for conversion' })
  @IsString()
  @IsOptional()
  targetCurrency?: string;

  @ApiPropertyOptional({ enum: ['budget', 'standard', 'luxury'], description: 'Package tier for margin calculation' })
  @IsOptional()
  @IsIn(['budget', 'standard', 'luxury'])
  packageTier?: 'budget' | 'standard' | 'luxury';

  @ApiPropertyOptional({ example: 10, description: 'Discount percentage to apply', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPct?: number;
}
