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
  @IsString()
  @MaxLength(100)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

class AdditionalDriverDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseNumber?: string;
}

export class SearchCarsDto {
  @IsUUID()
  pickupLocationId!: string;

  @IsOptional()
  @IsUUID()
  dropoffLocationId?: string;

  @IsDateString()
  pickupDate!: string;

  @IsDateString()
  dropoffDate!: string;

  @IsOptional()
  @IsIn(['economy', 'compact', 'suv', 'luxury', 'electric', 'minivan'])
  category?: CarCategory;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPricePerDay?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unlimitedMileage?: boolean;

  @IsOptional()
  @IsString()
  transmission?: string;
}

export class CreateCarBookingDto {
  @IsUUID()
  carId!: string;

  @IsUUID()
  pickupLocationId!: string;

  @IsUUID()
  dropoffLocationId!: string;

  @IsDateString()
  pickupDatetime!: string;

  @IsDateString()
  dropoffDatetime!: string;

  @IsIn(['basic', 'comprehensive', 'cdw', 'none'])
  insuranceType!: InsuranceType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarExtraItemDto)
  extras?: CarExtraItemDto[];

  @IsString()
  @MaxLength(200)
  driverName!: string;

  @IsString()
  @MaxLength(100)
  driverLicenseNumber!: string;

  @IsString()
  @MaxLength(2)
  driverNationality!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalDriverDto)
  additionalDrivers?: AdditionalDriverDto[];
}
