import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import { PassengerType } from "../entities/booking.entity";

class PassengerDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: "P1234567" })
  @IsString()
  passportNumber!: string;

  @ApiPropertyOptional({ example: "12A" })
  @IsOptional()
  @IsString()
  seatNumber?: string;

  @ApiProperty({ enum: ["ADULT", "CHILD", "INFANT"] })
  @IsEnum(["ADULT", "CHILD", "INFANT"])
  type!: PassengerType;

  @ApiProperty({ example: "2000-01-01" })
  @IsString()
  dob!: string;

  @ApiProperty({ enum: ["M", "F"] })
  @IsEnum(["M", "F"])
  gender!: "M" | "F";

  @ApiPropertyOptional({
    format: "uuid",
    description: "Saved traveler id from profile module",
  })
  @IsOptional()
  @IsUUID()
  savedTravelerId?: string;
}

export class CreateBookingDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { each: true, message: 'each value in flightIds must be a valid UUID format' })
  flightIds!: string[];

  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @ApiPropertyOptional({
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  })
  @IsOptional()
  @IsEnum(["PENDING", "PAID", "FAILED"])
  paymentStatus?: "PENDING" | "PAID" | "FAILED";

  @ApiPropertyOptional({ enum: ["USD", "AED", "EUR", "GBP"] })
  @IsOptional()
  @IsEnum(["USD", "AED", "EUR", "GBP"])
  currency?: "USD" | "AED" | "EUR" | "GBP";

  @ApiPropertyOptional({ description: "Raw XML pricing solution for Travelport SOAP API" })
  @IsOptional()
  @IsString()
  pricingSolutionXml?: string;
}
