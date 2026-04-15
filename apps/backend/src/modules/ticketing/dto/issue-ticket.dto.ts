import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class IssueTicketDto {
  @ApiProperty({ format: 'uuid', description: 'Booking UUID to issue ticket for' })
  @IsUUID()
  bookingId!: string;

  @ApiPropertyOptional({ example: 'ABC123', description: 'PNR code (6 uppercase alphanumeric characters). Overrides auto-generated PNR.' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/)
  pnrCode?: string;
}
