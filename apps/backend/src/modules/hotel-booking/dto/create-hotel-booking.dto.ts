import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateHotelBookingRoomDto {
  @ApiProperty({ format: 'uuid', description: 'Room UUID' })
  @IsUUID()
  roomId!: string;

  @ApiProperty({ example: 1, description: 'Number of rooms of this type', minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  quantity!: number;
}

class CreateHotelBookingGuestDto {
  @ApiProperty({ example: 'John Doe', description: 'Guest full name' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: 30, description: 'Guest age', minimum: 0, maximum: 120 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;

  @ApiProperty({ enum: ['ADULT', 'CHILD'], description: 'Guest type' })
  @IsEnum(['ADULT', 'CHILD'])
  type!: 'ADULT' | 'CHILD';

  @ApiProperty({ format: 'uuid', description: 'Room UUID this guest is assigned to' })
  @IsUUID()
  roomId!: string;
}

export class CreateHotelBookingDto {
  @ApiProperty({ format: 'uuid', description: 'Hotel UUID' })
  @IsUUID()
  hotelId!: string;

  @ApiProperty({ example: '2025-08-01', description: 'Check-in date (ISO date string)' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2025-08-05', description: 'Check-out date (ISO date string)' })
  @IsDateString()
  checkOutDate!: string;

  @ApiProperty({ type: [CreateHotelBookingRoomDto], description: 'Rooms to book' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBookingRoomDto)
  rooms!: CreateHotelBookingRoomDto[];

  @ApiProperty({ type: [CreateHotelBookingGuestDto], description: 'Guest list' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBookingGuestDto)
  guests!: CreateHotelBookingGuestDto[];

  @ApiPropertyOptional({ example: 'STRIPE', description: 'Payment provider to use' })
  @IsOptional()
  @IsString()
  paymentProvider?: string;
}
