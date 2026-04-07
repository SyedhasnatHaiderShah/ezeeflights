import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class IssueTicketDto {
  @IsUUID()
  bookingId!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9]{6}$/)
  pnrCode?: string;
}
