import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectFlightDto {
  @ApiProperty({ description: 'Search session ID from the search response' })
  @IsString()
  searchId!: string;

  @ApiProperty({ description: 'Flight ID (tranId) from the flight list item' })
  @IsString()
  flightId!: string;

  @ApiProperty({ example: 'JFK' })
  @IsString()
  from!: string;

  @ApiProperty({ example: 'PUJ' })
  @IsString()
  to!: string;

  @ApiProperty({ example: '2026-10-25T00:00:00Z' })
  @IsString()
  depDate!: string;

  @ApiPropertyOptional({ example: '2026-10-30T00:00:00Z' })
  @IsOptional()
  @IsString()
  retDate?: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  children?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  infants?: number;

  @ApiPropertyOptional({ description: '1 = one-way, 2 = round-trip', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  flightWay?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  flightClass?: number;

  @ApiPropertyOptional({ description: 'Bid ID if selecting a cheap bid', example: 123 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bidId?: number;

  @ApiPropertyOptional({ example: 'PKR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Total fare shown to user in UI (for price verification)', example: 450.0 })
  @IsOptional()
  @Type(() => Number)
  fareTotal?: number;

  @ApiPropertyOptional({ description: 'Base fare shown to user in UI', example: 380.0 })
  @IsOptional()
  @Type(() => Number)
  baseFare?: number;

  @ApiPropertyOptional({ description: 'Tax shown to user in UI', example: 70.0 })
  @IsOptional()
  @Type(() => Number)
  tax?: number;
}
