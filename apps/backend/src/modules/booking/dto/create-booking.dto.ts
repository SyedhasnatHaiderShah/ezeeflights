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
  IsIn,
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

  @ApiPropertyOptional({ example: "+1234567890" })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ enum: ["ADULT", "CHILD", "INFANT"] })
  @IsIn(["ADULT", "CHILD", "INFANT"])
  type!: PassengerType;

  @ApiPropertyOptional({ example: "2000-01-01" })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ enum: ["M", "F"] })
  @IsOptional()
  @IsIn(["M", "F"])
  gender?: "M" | "F";

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
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    each: true,
    message: "each value in flightIds must be a valid UUID format",
  })
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
  @IsIn(["PENDING", "PAID", "FAILED"])
  paymentStatus?: "PENDING" | "PAID" | "FAILED";

  @ApiPropertyOptional({
    example: "PKR",
    description:
      "User display/payment currency from the app (stored on booking; provider currency saved separately as default_currency)",
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: "Raw XML pricing solution for Travelport SOAP API",
  })
  @IsOptional()
  @IsString()
  pricingSolutionXml?: string;
}
