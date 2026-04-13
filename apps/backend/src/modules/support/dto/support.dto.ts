import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { TicketCategory, TicketChannel, TicketPriority, TicketStatus } from '../support.entity';

export class CreateTicketDto {
  @IsEnum([
    'flight_delay',
    'refund',
    'hotel_issue',
    'car_issue',
    'payment_problem',
    'booking_modification',
    'account_issue',
    'complaint',
    'general',
  ])
  category!: TicketCategory;

  @IsString()
  subject!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TicketPriority;

  @IsOptional()
  @IsEnum(['web', 'email', 'whatsapp', 'phone'])
  channel?: TicketChannel;

  @IsOptional()
  @IsArray()
  attachments?: Array<Record<string, unknown>>;
}

export class AddMessageDto {
  @IsString()
  body!: string;

  @IsOptional()
  @IsArray()
  attachments?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsBoolean()
  isInternalNote?: boolean;
}

export class CloseTicketDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'])
  status!: TicketStatus;
}
