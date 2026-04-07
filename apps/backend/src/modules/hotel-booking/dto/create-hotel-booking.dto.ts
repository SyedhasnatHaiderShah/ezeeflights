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
  @IsUUID()
  roomId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  quantity!: number;
}

class CreateHotelBookingGuestDto {
  @IsString()
  fullName!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;

  @IsEnum(['ADULT', 'CHILD'])
  type!: 'ADULT' | 'CHILD';

  @IsUUID()
  roomId!: string;
}

export class CreateHotelBookingDto {
  @IsUUID()
  hotelId!: string;

  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBookingRoomDto)
  rooms!: CreateHotelBookingRoomDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBookingGuestDto)
  guests!: CreateHotelBookingGuestDto[];

  @IsOptional()
  @IsString()
  paymentProvider?: string;
}
