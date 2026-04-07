import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { PassengerType } from '../entities/booking.entity';

class PassengerDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 'P1234567' })
  @IsString()
  passportNumber!: string;

  @ApiProperty({ example: '12A' })
  @IsString()
  @Matches(/^[0-9]{1,2}[A-Z]$/, { message: 'seatNumber must look like 12A' })
  seatNumber!: string;

  @ApiProperty({ enum: ['ADULT', 'CHILD', 'INFANT'] })
  @IsEnum(['ADULT', 'CHILD', 'INFANT'])
  type!: PassengerType;

  @ApiPropertyOptional({ format: 'uuid', description: 'Saved traveler id from profile module' })
  @IsOptional()
  @IsUUID()
  savedTravelerId?: string;
}

export class CreateBookingDto {
  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(undefined, { each: true })
  flightIds!: string[];

  @ApiProperty({ type: [PassengerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @ApiPropertyOptional({ enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAILED'])
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';

  @ApiPropertyOptional({ enum: ['USD', 'AED', 'EUR', 'GBP'] })
  @IsOptional()
  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency?: 'USD' | 'AED' | 'EUR' | 'GBP';
}
