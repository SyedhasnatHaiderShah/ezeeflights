import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class GeneratePnrDto {
  @IsUUID()
  bookingId!: string;

  @IsOptional()
  @IsIn(['AMADEUS', 'SABRE', 'TRAVELPORT', 'INTERNAL'])
  provider?: 'AMADEUS' | 'SABRE' | 'TRAVELPORT' | 'INTERNAL';
}
