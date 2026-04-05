import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsOptional()
  flightId?: string;

  @IsUUID()
  @IsOptional()
  hotelId?: string;

  @IsUUID()
  @IsOptional()
  tripId?: string;

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';
}
