import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { AttractionCategory } from '../entities/destination.entity';

export class AttractionFilterDto {
  @ApiPropertyOptional({ example: 'Dubai', description: 'Filter by city name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: ['museum', 'beach', 'hiking', 'nightlife', 'shopping', 'food'], description: 'Attraction category filter' })
  @IsOptional()
  @IsEnum(['museum', 'beach', 'hiking', 'nightlife', 'shopping', 'food'])
  category?: AttractionCategory;

  @ApiPropertyOptional({ example: 4.0, description: 'Minimum rating filter', minimum: 0 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  rating?: number;

  @ApiPropertyOptional({ example: 10, description: 'Maximum distance in km', minimum: 0 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @ApiPropertyOptional({ example: 25.2048, description: 'Latitude for geo-filtering' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 55.2708, description: 'Longitude for geo-filtering' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ example: 12, description: 'Results per page', minimum: 1, maximum: 50, default: 12 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit = 12;
}

export class CreateAttractionReviewDto {
  @ApiProperty({ example: 5, description: 'Rating (1–5)', minimum: 1, maximum: 5 })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Amazing place, highly recommend!', description: 'Review comment' })
  @IsString()
  comment!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/review.jpg', description: 'Optional review image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CityEventsQueryDto {
  @ApiPropertyOptional({ example: '2025-08-01', description: 'Events from this date (ISO date string)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2025-08-31', description: 'Events up to this date (ISO date string)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AiRecommendationsQueryDto {
  @ApiProperty({ example: 'Paris', description: 'City to get AI recommendations for' })
  @IsString()
  city!: string;
}

export class AiTopAttractionsDto {
  @ApiProperty({ example: 'Tokyo', description: 'City to get top attractions for' })
  @IsString()
  city!: string;

  @ApiProperty({ enum: ['solo', 'family', 'couple'], description: 'Traveler type' })
  @IsIn(['solo', 'family', 'couple'])
  travelerType!: 'solo' | 'family' | 'couple';

  @ApiProperty({ type: [String], example: ['history', 'food', 'art'], description: 'Traveler interests' })
  @IsArray()
  @IsString({ each: true })
  interests!: string[];
}

export class MapNearbyQueryDto {
  @ApiProperty({ example: 25.2048, description: 'Latitude of the center point' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: 55.2708, description: 'Longitude of the center point' })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  longitude!: number;

  @ApiPropertyOptional({ example: 5, description: 'Search radius in km', minimum: 0.1, default: 5 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.1)
  radiusKm = 5;

  @ApiPropertyOptional({ example: 10, description: 'Map zoom level', minimum: 1, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  zoom = 10;
}

export class TourQueryDto {
  @ApiPropertyOptional({ example: 'USD', description: 'Currency code for tour pricing' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class WishlistParamsDto {
  @ApiProperty({ format: 'uuid', description: 'Attraction UUID to add/remove from wishlist' })
  @IsUUID()
  attractionId!: string;
}
