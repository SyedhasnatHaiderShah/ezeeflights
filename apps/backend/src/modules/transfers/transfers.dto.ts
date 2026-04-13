import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { TransferDirection } from './transfers.entity';

export class SearchTransferDto {
  @IsString()
  @Length(3, 3)
  originIata!: string;

  @IsString()
  @Length(2, 100)
  destinationCity!: string;

  @IsDateString()
  pickupDatetime!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  passengerCount!: number;

  @IsEnum(['airport_to_hotel', 'hotel_to_airport', 'point_to_point'])
  direction!: TransferDirection;
}

export class CreateTransferBookingDto {
  @IsUUID()
  vehicleId!: string;

  @IsEnum(['airport_to_hotel', 'hotel_to_airport', 'point_to_point'])
  direction!: TransferDirection;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  flightNumber?: string;

  @IsOptional()
  @IsDateString()
  flightArrivalDatetime?: string;

  @IsDateString()
  pickupDatetime!: string;

  @IsString()
  pickupAddress!: string;

  @IsString()
  dropoffAddress!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  passengerCount!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  luggageCount!: number;

  @IsString()
  @Length(2, 200)
  passengerName!: string;

  @IsString()
  @Length(6, 30)
  passengerPhone!: string;

  @IsOptional()
  @IsEmail()
  passengerEmail?: string;

  @IsOptional()
  @IsBoolean()
  meetAndGreet?: boolean;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
