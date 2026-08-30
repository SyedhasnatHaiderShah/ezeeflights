import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsaMarkupDto {
  @ApiProperty({ example: 'US', description: 'Origin country/airport code' })
  @IsString()
  source!: string;

  @ApiProperty({ example: 'TC', description: 'Destination country/airport code' })
  @IsString()
  destination!: string;

  @ApiProperty({ example: 'UA', description: 'Airline IATA code' })
  @IsString()
  airline!: string;

  @ApiProperty({ example: '04/01/2027', description: 'Rule start date (MM/DD/YYYY)' })
  @IsString()
  startDate!: string;

  @ApiProperty({ example: '04/30/2027', description: 'Rule end date (MM/DD/YYYY)' })
  @IsString()
  endDate!: string;

  @ApiProperty({
    enum: ['percentage', 'fixed', 'replace'],
    description:
      'fixed = deduct abs(amount) from base fare; ' +
      'percentage = deduct abs(amount)% of base fare; ' +
      'replace = set base fare to abs(amount) exactly',
  })
  @IsEnum(['percentage', 'fixed', 'replace'])
  markupType!: 'percentage' | 'fixed' | 'replace';

  @ApiProperty({ example: 'Return', description: 'Journey type (Return or OneWay)' })
  @IsEnum(['Return', 'OneWay'])
  journeyType!: 'Return' | 'OneWay';

  @ApiProperty({ example: 'Economy', description: 'Cabin class' })
  @IsString()
  cabinClass!: string;

  @ApiProperty({ example: 15, description: 'Adult deduction amount (always treated as positive)' })
  @Type(() => Number)
  @IsInt()
  adultAmount!: number;

  @ApiProperty({ example: 10, description: 'Child deduction amount (always treated as positive)' })
  @Type(() => Number)
  @IsInt()
  childAmount!: number;

  @ApiProperty({ example: 0, description: 'Infant deduction amount (always treated as positive)' })
  @Type(() => Number)
  @IsInt()
  infantAmount!: number;

  @ApiPropertyOptional({ example: 'user-uuid', description: 'User ID who created the rule' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'Admin User', description: 'User name who created the rule' })
  @IsOptional()
  @IsString()
  userName?: string;
}
