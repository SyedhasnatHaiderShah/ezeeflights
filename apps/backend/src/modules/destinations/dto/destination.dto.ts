import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { AttractionCategory } from '../entities/destination.entity';

export class AttractionFilterDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['museum', 'beach', 'hiking', 'nightlife', 'shopping', 'food'])
  category?: AttractionCategory;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  rating?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit = 12;
}

export class CreateAttractionReviewDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  comment!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CityEventsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AiRecommendationsQueryDto {
  @IsString()
  city!: string;
}

export class AiTopAttractionsDto {
  @IsString()
  city!: string;

  @IsIn(['solo', 'family', 'couple'])
  travelerType!: 'solo' | 'family' | 'couple';

  @IsArray()
  @IsString({ each: true })
  interests!: string[];
}

export class MapNearbyQueryDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  latitude!: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0.1)
  radiusKm = 5;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  zoom = 10;
}

export class TourQueryDto {
  @IsOptional()
  @IsString()
  currency?: string;
}

export class WishlistParamsDto {
  @IsUUID()
  attractionId!: string;
}
