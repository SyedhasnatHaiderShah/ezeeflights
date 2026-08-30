import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateCheapBidDto {
  @IsOptional()
  @IsInt()
  createdBy?: number;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  source?: string;

  @IsString()
  @MaxLength(10)
  originFrom: string;

  @IsString()
  @MaxLength(10)
  destinationTo: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  airLine?: string;

  @IsOptional()
  @IsString()
  travellType?: string;

  @IsOptional()
  @IsString()
  cabin?: string;

  @IsDateString()
  departureDate: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bidAdtPrice?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bidChdPrice?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bidInfPrice?: number | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  originalAdtPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  originalChdPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  originalInfPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  currency?: string;

  @IsDateString()
  linkExpiryDate: string;

  @IsOptional()
  @IsString()
  @IsIn(["replace", "percentage"])
  discountType?: string;

  @IsOptional()
  @IsString()
  flightId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stops?: number;
}
