import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { TicketCategory, TicketChannel, TicketPriority, TicketStatus } from '../support.entity';

export class CreateTicketDto {
  @ApiProperty({
    enum: ['flight_delay', 'refund', 'hotel_issue', 'car_issue', 'payment_problem', 'booking_modification', 'account_issue', 'complaint', 'general'],
    description: 'Support ticket category',
  })
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

  @ApiProperty({ example: 'Flight delayed by 3 hours', description: 'Ticket subject' })
  @IsString()
  subject!: string;

  @ApiProperty({ example: 'My flight EK201 was delayed...', description: 'Detailed description of the issue' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Related booking UUID' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high', 'urgent'], description: 'Ticket priority' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TicketPriority;

  @ApiPropertyOptional({ enum: ['web', 'email', 'whatsapp', 'phone'], description: 'Channel through which the ticket was created' })
  @IsOptional()
  @IsEnum(['web', 'email', 'whatsapp', 'phone'])
  channel?: TicketChannel;

  @ApiPropertyOptional({ type: [Object], description: 'File attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Array<Record<string, unknown>>;
}

export class AddMessageDto {
  @ApiProperty({ example: 'Please check my booking reference...', description: 'Message body' })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ type: [Object], description: 'File attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Array<Record<string, unknown>>;

  @ApiPropertyOptional({ example: false, description: 'Whether this is an internal agent note' })
  @IsOptional()
  @IsBoolean()
  isInternalNote?: boolean;
}

export class CloseTicketDto {
  @ApiPropertyOptional({ example: 5, description: 'Customer satisfaction rating (1–5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Issue resolved quickly', description: 'Optional feedback comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'], description: 'New ticket status' })
  @IsEnum(['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'])
  status!: TicketStatus;
}
