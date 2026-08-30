import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

export class CrmBookingTravelerDto {
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

export class CreateCrmBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  flightId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  departDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  returnDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tripType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cabinClass?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  adults?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  infants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  flightSnapshot?: Record<string, unknown>;

  @ApiProperty({ type: [CrmBookingTravelerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrmBookingTravelerDto)
  travelers!: CrmBookingTravelerDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;
}
