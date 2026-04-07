import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchFlightsDto {
  @IsString()
  origin!: string;

  @IsString()
  destination!: string;

  @IsDateString()
  departureDate!: string;

  @IsOptional()
  @IsString()
  airline?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  stops?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

  @IsOptional()
  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency?: 'USD' | 'AED' | 'EUR' | 'GBP';

  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
