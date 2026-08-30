import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class HotelTravelerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  nationality?: string;
}

export class BookHotelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hotelId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  checkInDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  checkOutDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactPhone: string;

  @ApiProperty({ type: [HotelTravelerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotelTravelerDto)
  travelers: HotelTravelerDto[];

  @ApiProperty()
  @IsOptional()
  hotelSnapshot?: any;
}
