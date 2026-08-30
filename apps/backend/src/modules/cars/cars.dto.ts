import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { InsuranceType } from './cars.entity';

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
  @ApiProperty({ description: 'Pickup location IATA code or UUID' })
  @IsString()
  pickupLocationId!: string;

  @ApiPropertyOptional({ description: 'Dropoff location IATA code or UUID (if different from pickup)' })
  @IsOptional()
  @IsString()
  dropoffLocationId?: string;

  @ApiProperty({ example: '2025-08-01T10:00:00', description: 'Pickup date (ISO date string)' })
  @IsString()
  pickupDate!: string;

  @ApiProperty({ example: '2025-08-08T10:00:00', description: 'Dropoff date (ISO date string)' })
  @IsString()
  dropoffDate!: string;

  @ApiPropertyOptional({ enum: ['economy', 'compact', 'suv', 'luxury', 'electric', 'minivan', 'All'], description: 'Car category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 150, description: 'Maximum price per day', minimum: 0 })
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
  @ApiProperty({ description: 'Car ID (Travelport ID or local UUID)' })
  @IsString()
  carId!: string;

  @ApiPropertyOptional({ description: 'Travelport car name' })
  @IsOptional()
  @IsString()
  carName?: string;

  @ApiPropertyOptional({ description: 'Travelport vendor code' })
  @IsOptional()
  @IsString()
  vendorCode?: string;

  @ApiPropertyOptional({ description: 'Selected car snapshot from search (USD prices)' })
  @IsOptional()
  carSnapshot?: Record<string, any>;

  @ApiPropertyOptional({ example: 'alex@example.com', description: 'Contact email' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Contact phone' })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Base price per day from Travelport' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 'PKR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Pickup location IATA code or UUID' })
  @IsString()
  pickupLocationId!: string;

  @ApiProperty({ description: 'Dropoff location IATA code or UUID' })
  @IsString()
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
  @MaxLength(50)
  driverNationality!: string;

  @ApiPropertyOptional({ example: '1990-05-15', description: 'Primary driver date of birth' })
  @IsOptional()
  @IsString()
  driverDob?: string;

  @ApiPropertyOptional({ example: 'M', description: 'Primary driver gender' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  driverGender?: string;

  @ApiPropertyOptional({ type: [AdditionalDriverDto], description: 'Additional drivers to add to the booking' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalDriverDto)
  additionalDrivers?: AdditionalDriverDto[];
}

export class SelectCarDto {
  @ApiProperty({ description: 'Car ID (Travelport ID or local UUID)' })
  @IsString()
  carId!: string;

  @ApiProperty({ description: 'Pickup location IATA code' })
  @IsString()
  pickupLocationId!: string;

  @ApiPropertyOptional({ description: 'Dropoff location IATA code' })
  @IsOptional()
  @IsString()
  dropoffLocationId?: string;

  @ApiProperty({ example: '2025-08-01T10:00:00Z', description: 'Pickup date' })
  @IsString()
  pickupDate!: string;

  @ApiProperty({ example: '2025-08-08T10:00:00Z', description: 'Dropoff date' })
  @IsString()
  dropoffDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rateToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  inventoryToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rateCode?: string;

  /** Total price the user saw in the UI (in USD) — used for price-change verification */
  @ApiPropertyOptional({ example: 698.06, description: 'Total price shown to user (USD)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency of totalPrice' })
  @IsOptional()
  @IsString()
  currency?: string;
}
