import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
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
}
