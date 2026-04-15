import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CarCategory, InsuranceType } from './cars.entity';

class CarExtraItemDto {
  @ApiProperty({ example: 'GPS Navigation', description: 'Extra item name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 10, description: 'Extra item price per day (USD)', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

class AdditionalDriverDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Additional driver full name' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'DL-987654', description: 'Additional driver license number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;
}

export class SearchCarsDto {
  @ApiProperty({ format: 'uuid', description: 'Pickup location UUID' })
  @IsUUID()
  pickupLocationId!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Dropoff location UUID (if different from pickup)' })
  @IsOptional()
  @IsUUID()
  dropoffLocationId?: string;

  @ApiProperty({ example: '2025-08-01', description: 'Pickup date (ISO date string)' })
  @IsDateString()
  pickupDate!: string;

  @ApiProperty({ example: '2025-08-08', description: 'Dropoff date (ISO date string)' })
  @IsDateString()
  dropoffDate!: string;

  @ApiPropertyOptional({ enum: ['economy', 'compact', 'suv', 'luxury', 'electric', 'minivan'], description: 'Car category filter' })
  @IsOptional()
  @IsIn(['economy', 'compact', 'suv', 'luxury', 'electric', 'minivan'])
  category?: CarCategory;

  @ApiPropertyOptional({ example: 150, description: 'Maximum price per day (USD)', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPricePerDay?: number;

  @ApiPropertyOptional({ example: true, description: 'Filter for unlimited mileage cars' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unlimitedMileage?: boolean;

  @ApiPropertyOptional({ example: 'automatic', description: 'Transmission type filter (automatic/manual)' })
  @IsOptional()
  @IsString()
  transmission?: string;
}

export class CreateCarBookingDto {
  @ApiProperty({ format: 'uuid', description: 'Car UUID to book' })
  @IsUUID()
  carId!: string;

  @ApiProperty({ format: 'uuid', description: 'Pickup location UUID' })
  @IsUUID()
  pickupLocationId!: string;

  @ApiProperty({ format: 'uuid', description: 'Dropoff location UUID' })
  @IsUUID()
  dropoffLocationId!: string;

  @ApiProperty({ example: '2025-08-01T10:00:00Z', description: 'Pickup datetime (ISO 8601)' })
  @IsDateString()
  pickupDatetime!: string;

  @ApiProperty({ example: '2025-08-08T10:00:00Z', description: 'Dropoff datetime (ISO 8601)' })
  @IsDateString()
  dropoffDatetime!: string;

  @ApiProperty({ enum: ['basic', 'comprehensive', 'cdw', 'none'], description: 'Insurance type' })
  @IsIn(['basic', 'comprehensive', 'cdw', 'none'])
  insuranceType!: InsuranceType;

  @ApiPropertyOptional({ type: [CarExtraItemDto], description: 'Optional extras (GPS, child seat, etc.)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarExtraItemDto)
  extras?: CarExtraItemDto[];

  @ApiProperty({ example: 'John Doe', description: 'Primary driver full name' })
  @IsString()
  @MaxLength(200)
  driverName!: string;

  @ApiProperty({ example: 'DL-123456', description: 'Primary driver license number' })
  @IsString()
  @MaxLength(100)
  driverLicenseNumber!: string;

  @ApiProperty({ example: 'AE', description: 'Primary driver nationality (ISO 3166-1 alpha-2 country code)' })
  @IsString()
  @MaxLength(2)
  driverNationality!: string;

  @ApiPropertyOptional({ type: [AdditionalDriverDto], description: 'Additional drivers to add to the booking' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalDriverDto)
  additionalDrivers?: AdditionalDriverDto[];
}
