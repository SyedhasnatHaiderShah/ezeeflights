import { IsInt, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ReserveSeatDto {
  @IsUUID()
  flightId!: string;

  @IsInt()
  @Min(1)
  row!: number;

  @IsString()
  @MaxLength(1)
  col!: string;

  @IsInt()
  @Min(0)
  passengerIndex!: number;
}

