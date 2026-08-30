import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ReserveSeatDto {
  @ApiProperty({ format: 'uuid', description: 'Flight UUID to reserve seat on' })
  @IsUUID()
  flightId!: string;

  @ApiProperty({ example: 12, description: 'Seat row number', minimum: 1 })
  @IsInt()
  @Min(1)
  row!: number;

  @ApiProperty({ example: 'A', description: 'Seat column letter (A–F)' })
  @IsString()
  @MaxLength(1)
  col!: string;

  @ApiProperty({ example: 0, description: 'Zero-based passenger index in the booking', minimum: 0 })
  @IsInt()
  @Min(0)
  passengerIndex!: number;
}

