import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchRoomsDto {
  @ApiProperty({ example: '2025-08-01', description: 'Check-in date (ISO date string)' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return value;
  })
  @IsDateString()
  checkInDate!: string;

  @ApiProperty({ example: '2025-08-05', description: 'Check-out date (ISO date string)' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return value;
  })
  @IsDateString()
  checkOutDate!: string;
}
