import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class SearchRoomsDto {
  @ApiProperty({ example: '2025-08-01', description: 'Check-in date (ISO date string)' })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2025-08-05', description: 'Check-out date (ISO date string)' })
  @IsDateString()
  checkOutDate!: string;
}
