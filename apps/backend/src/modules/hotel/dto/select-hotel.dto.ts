import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class SelectHotelDto {
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
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  currency?: string;
}
