import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

class CreateHotelBookingRoomDto {
  @ApiProperty({ description: "Room ID" })
  @IsString()
  roomId!: string;

  @ApiProperty({
    example: 1,
    description: "Number of rooms of this type",
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  quantity!: number;
}

class CreateHotelBookingGuestDto {
  @ApiProperty({ example: "John", description: "Guest first name" })
  @IsString()
  firstName!: string;

  @ApiPropertyOptional({ example: "Paul", description: "Guest middle name" })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: "Doe", description: "Guest last name" })
  @IsString()
  lastName!: string;

  @ApiProperty({
    example: 30,
    description: "Guest age",
    minimum: 0,
    maximum: 120,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  age!: number;

  @ApiProperty({ enum: ["ADULT", "CHILD"], description: "Guest type" })
  @IsEnum(["ADULT", "CHILD"])
  type!: "ADULT" | "CHILD";

  @ApiProperty({
    description: "Room ID this guest is assigned to",
  })
  @IsString()
  roomId!: string;

  @ApiPropertyOptional({
    example: "Non-smoking, King bed",
    description: "Guest preferences",
  })
  @IsString()
  @IsOptional()
  preferences?: string;
}

export class CreateHotelBookingDto {
  @ApiProperty({ description: "Hotel ID" })
  @IsString()
  hotelId!: string;

  @ApiProperty({
    example: "2025-08-01",
    description: "Check-in date (ISO date string)",
  })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({
    example: "2025-08-05",
    description: "Check-out date (ISO date string)",
  })
  @IsDateString()
  checkOutDate!: string;

  @ApiProperty({
    type: [CreateHotelBookingRoomDto],
    description: "Rooms to book",
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBookingRoomDto)
  rooms!: CreateHotelBookingRoomDto[];

  @ApiProperty({
    type: [CreateHotelBookingGuestDto],
    description: "Guest list",
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateHotelBookingGuestDto)
  guests!: CreateHotelBookingGuestDto[];

  @ApiPropertyOptional({ description: "City code for the hotel (e.g. DXB). Used for fallback search." })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    example: "SEK",
    description:
      "User display/payment currency from the app (stored as booking currency; USD saved as default_currency, same pattern as flight bookings)",
  })
  @IsString()
  @IsOptional()
  displayCurrency?: string;

  @ApiPropertyOptional({
    example: "john@example.com",
    description: "Booking contact email (collected once, not per guest)",
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({
    example: "+923001234567",
    description: "Booking contact phone (collected once, not per guest)",
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  // paymentProvider removed — initiate payment separately via POST /hotel-bookings/:id/pay
}
