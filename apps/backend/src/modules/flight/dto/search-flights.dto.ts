import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchFlightsDto {
  @ApiProperty({ example: 'DXB', description: 'Origin airport IATA code or city' })
  @IsString()
  origin!: string;

  @ApiProperty({ example: 'LHR', description: 'Destination airport IATA code or city' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: '2025-08-01', description: 'Departure date (ISO date string)' })
  @IsDateString()
  departureDate!: string;

  @ApiPropertyOptional({ example: 'EK', description: 'Filter by airline code' })
  @IsOptional()
  @IsString()
  airline?: string;

  @ApiPropertyOptional({ example: 0, description: 'Maximum number of stops (0=direct)', minimum: 0, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  stops?: number;

  @ApiPropertyOptional({ example: 200, description: 'Minimum price filter', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 1500, description: 'Maximum price filter', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'], description: 'Cabin class' })
  @IsOptional()
  @IsEnum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

  @ApiPropertyOptional({ enum: ['USD', 'AED', 'EUR', 'GBP'], description: 'Currency for prices' })
  @IsOptional()
  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency?: 'USD' | 'AED' | 'EUR' | 'GBP';

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 20, description: 'Results per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
