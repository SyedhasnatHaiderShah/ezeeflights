import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class GeneratePnrDto {
  @ApiProperty({ format: 'uuid', description: 'Booking UUID to generate PNR for' })
  @IsUUID()
  bookingId!: string;

  @ApiPropertyOptional({ enum: ['AMADEUS', 'SABRE', 'TRAVELPORT', 'INTERNAL'], description: 'GDS provider for PNR generation' })
  @IsOptional()
  @IsIn(['AMADEUS', 'SABRE', 'TRAVELPORT', 'INTERNAL'])
  provider?: 'AMADEUS' | 'SABRE' | 'TRAVELPORT' | 'INTERNAL';
}
