import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsEmail,
} from "class-validator";

export class InquiryTravelerDto {
  @ApiProperty({ example: "John" })
  @IsString()
  firstName!: string;

  @ApiPropertyOptional({ example: "Paul" })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({ example: "AA1234567" })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ example: "1990-05-15" })
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ example: "Pakistani" })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: "MALE" })
  @IsOptional()
  @IsString()
  gender?: string;
}

export class CreateInquiryDto {
  @ApiProperty({ example: "9c7ab443-001e-bb08-11e2-79f282db3097" })
  @IsString()
  flightId!: string;

  @ApiPropertyOptional({ example: "LHE" })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: "DXB" })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ example: "2026-05-28" })
  @IsOptional()
  @IsString()
  departDate?: string;

  @ApiPropertyOptional({ example: "one-way" })
  @IsOptional()
  @IsString()
  tripType?: string;

  @ApiPropertyOptional({ example: "Economy" })
  @IsOptional()
  @IsString()
  cabinClass?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  adults?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  infants?: number;

  @ApiPropertyOptional({ description: "Full flight details JSON snapshot" })
  @IsOptional()
  flightSnapshot?: Record<string, unknown>;

  @ApiProperty({ type: [InquiryTravelerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InquiryTravelerDto)
  travelers!: InquiryTravelerDto[];

  @ApiPropertyOptional({ example: "john@example.com" })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: "+923001234567" })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    example: "REVIEWED",
    description: "Optional inquiry status override after payment or agent flow",
  })
  @IsOptional()
  @IsString()
  status?: string;
}
