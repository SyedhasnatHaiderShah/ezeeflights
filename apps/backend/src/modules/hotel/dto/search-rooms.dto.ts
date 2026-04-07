import { IsDateString } from 'class-validator';

export class SearchRoomsDto {
  @IsDateString()
  checkInDate!: string;

  @IsDateString()
  checkOutDate!: string;
}
