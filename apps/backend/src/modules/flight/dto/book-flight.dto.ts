import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TravelerDto {
  @ApiProperty({ example: 'ADT', description: 'Passenger type: ADT, CNN, INF' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: '1990-01-01', description: 'Date of birth YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  dob!: string;

  @ApiProperty({ example: 'M', description: 'Gender M/F' })
  @IsString()
  @IsNotEmpty()
  gender!: string;
}

export class BookFlightDto {
  @ApiProperty({ example: 'UUID-here', description: 'The Flight UUID from the search response' })
  @IsString()
  @IsNotEmpty()
  flightId!: string;

  @ApiProperty({ type: [TravelerDto], description: 'Detailed traveler information' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravelerDto)
  travelers!: TravelerDto[];

  @ApiProperty({ example: '<air:AirPricingSolution>...</air:AirPricingSolution>', description: 'Raw XML pricing solution returned from the price endpoint (required by Travelport)' })
  @IsString()
  @IsNotEmpty()
  pricingSolutionXml!: string;
}
