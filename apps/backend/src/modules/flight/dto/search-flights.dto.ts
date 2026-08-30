import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export class SearchFlightsDto {
  @ApiProperty({
    example: "DXB",
    description: "Origin airport IATA code or city",
  })
  @IsString()
  origin!: string;

  @ApiProperty({
    example: "LHR",
    description: "Destination airport IATA code or city",
  })
  @IsString()
  destination!: string;

  @ApiProperty({
    example: "2025-08-01",
    description: "Departure date (ISO date string)",
  })
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    return value;
  })
  @IsDateString()
  departureDate!: string;

  @ApiPropertyOptional({ example: "EK", description: "Filter by airline code" })
  @IsOptional()
  @IsString()
  airline?: string;

  @ApiPropertyOptional({
    example: 0,
    description: "Maximum number of stops (0=direct)",
    minimum: 0,
    maximum: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(3)
  stops?: number;

  @ApiPropertyOptional({
    example: 200,
    description: "Minimum price filter",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    example: 1500,
    description: "Maximum price filter",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    enum: ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST", "ALL"],
    description: "Cabin class",
  })
  @IsOptional()
  @IsEnum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST", "ALL"])
  cabinClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST" | "ALL";

  @ApiPropertyOptional({
    enum: ["USD", "AED", "EUR", "GBP", "INR"],
    description: "Currency for prices",
  })
  @IsOptional()
  @IsEnum(["USD", "AED", "EUR", "GBP", "INR"])
  currency?: "USD" | "AED" | "EUR" | "GBP" | "INR";

  @ApiPropertyOptional({
    example: 1,
    description: "Page number",
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 20,
    description: "Results per page",
    minimum: 1,
    maximum: 2000,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  limit = 20;

  @ApiPropertyOptional({
    example: "2025-08-10",
    description: "Return date (ISO date string)",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    return value;
  })
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({
    example: "one-way",
    description: "Trip type: one-way or round-trip",
    enum: ["one-way", "round-trip", "multi-city"],
  })
  @IsOptional()
  @IsString()
  trip?: string;

  @ApiPropertyOptional({
    example: 1,
    description: "EzeeFlights flightWay: 1 = one-way, 2 = round-trip",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  flightWay?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Number of adults",
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults = 1;

  @ApiPropertyOptional({
    example: 0,
    description: "Number of children",
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children = 0;

  @ApiPropertyOptional({
    example: 0,
    description: "Number of infants",
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  infants = 0;

  @ApiPropertyOptional({ example: 'jetcost', description: 'UTM source for tracking' })
  @IsOptional()
  @IsString()
  utmSource?: string;

  @ApiPropertyOptional({ example: 'metasearch' })
  @IsOptional()
  @IsString()
  utmMedium?: string;

  @ApiPropertyOptional({ example: 'summer2026' })
  @IsOptional()
  @IsString()
  utmCampaign?: string;

  @ApiPropertyOptional({ example: 'FUS13_6a199cb3b78a9' })
  @IsOptional()
  @IsString()
  ref?: string;

  @ApiPropertyOptional({ example: 'TP_META_001' })
  @IsOptional()
  @IsString()
  tCode?: string;
}

