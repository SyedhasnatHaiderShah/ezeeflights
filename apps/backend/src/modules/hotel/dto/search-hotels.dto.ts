import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SearchHotelsDto {
  @ApiProperty({ example: 'Dubai', description: 'City name', maxLength: 120 })
  @IsString()
  @MaxLength(120)
  city!: string;

  @ApiProperty({ example: '2025-08-01', description: 'Check-in date (ISO date string)' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2025-08-05', description: 'Check-out date (ISO date string)' })
  @IsDateString()
  checkOutDate!: string;

  @ApiPropertyOptional({ example: 100, description: 'Minimum price per night', minimum: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 500, description: 'Maximum price per night', minimum: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 4, description: 'Minimum star rating (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ example: 'pool,spa', description: 'Comma-separated amenity filters' })
  @IsOptional()
  @IsString()
  amenities?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 20, description: 'Results per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
