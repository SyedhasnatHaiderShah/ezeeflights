import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { TransferDirection } from './transfers.entity';

export class SearchTransferDto {
  @ApiProperty({ example: 'DXB', description: 'Origin airport IATA code (3 letters)' })
  @IsString()
  @Length(3, 3)
  originIata!: string;

  @ApiProperty({ example: 'Dubai Marina', description: 'Destination city or area name' })
  @IsString()
  @Length(2, 100)
  destinationCity!: string;

  @ApiProperty({ example: '2025-08-01T14:00:00Z', description: 'Requested pickup datetime (ISO 8601)' })
  @IsDateString()
  pickupDatetime!: string;

  @ApiProperty({ example: 2, description: 'Number of passengers', minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  passengerCount!: number;

  @ApiProperty({ enum: ['airport_to_hotel', 'hotel_to_airport', 'point_to_point'], description: 'Transfer direction' })
  @IsEnum(['airport_to_hotel', 'hotel_to_airport', 'point_to_point'])
  direction!: TransferDirection;
}

export class CreateTransferBookingDto {
  @ApiProperty({ format: 'uuid', description: 'Vehicle UUID to book' })
  @IsUUID()
  vehicleId!: string;

  @ApiProperty({ enum: ['airport_to_hotel', 'hotel_to_airport', 'point_to_point'], description: 'Transfer direction' })
  @IsEnum(['airport_to_hotel', 'hotel_to_airport', 'point_to_point'])
  direction!: TransferDirection;

  @ApiPropertyOptional({ example: 'EK201', description: 'Flight number (for airport transfers)' })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  flightNumber?: string;

  @ApiPropertyOptional({ example: '2025-08-01T13:30:00Z', description: 'Flight arrival datetime (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  flightArrivalDatetime?: string;

  @ApiProperty({ example: '2025-08-01T14:00:00Z', description: 'Pickup datetime (ISO 8601)' })
  @IsDateString()
  pickupDatetime!: string;

  @ApiProperty({ example: 'Dubai International Airport, Terminal 3', description: 'Pickup address' })
  @IsString()
  pickupAddress!: string;

  @ApiProperty({ example: 'Burj Al Arab Hotel, Jumeirah', description: 'Dropoff address' })
  @IsString()
  dropoffAddress!: string;

  @ApiProperty({ example: 2, description: 'Number of passengers', minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  passengerCount!: number;

  @ApiProperty({ example: 2, description: 'Number of luggage pieces', minimum: 0, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  luggageCount!: number;

  @ApiProperty({ example: 'John Doe', description: 'Lead passenger full name' })
  @IsString()
  @Length(2, 200)
  passengerName!: string;

  @ApiProperty({ example: '+971501234567', description: 'Lead passenger phone number' })
  @IsString()
  @Length(6, 30)
  passengerPhone!: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Lead passenger email address' })
  @IsOptional()
  @IsEmail()
  passengerEmail?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether meet-and-greet service is required' })
  @IsOptional()
  @IsBoolean()
  meetAndGreet?: boolean;

  @ApiPropertyOptional({ example: 'Wheelchair accessible vehicle required', description: 'Any special requests' })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}
