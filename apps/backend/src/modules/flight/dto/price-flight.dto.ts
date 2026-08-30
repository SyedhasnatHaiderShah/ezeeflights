import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class PassengerDto {
  @ApiProperty({ example: "ADT", description: "Passenger type: ADT, CNN, INF" })
  @IsString()
  @IsNotEmpty()
  type!: string;
}

export class PriceFlightDto {
  @ApiProperty({
    example: "UUID-here",
    description: "The Flight UUID from the search response",
  })
  @IsString()
  @IsNotEmpty()
  flightId!: string;

  @ApiProperty({
    type: [PassengerDto],
    description: "List of passengers to price for",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @ApiProperty({
    example: "Business",
    description: "The desired cabin class for pricing",
    required: false,
  })
  @IsString()
  @IsOptional()
  cabinClass?: string;

  @ApiProperty({
    example: "PKR",
    description: "The target currency for price return",
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;
}
