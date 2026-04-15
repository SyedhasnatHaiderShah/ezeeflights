import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiPropertyOptional({ description: 'Webhook signature header value' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiProperty({ type: 'object', description: 'Raw webhook payload from payment provider' })
  @IsObject()
  payload!: Record<string, unknown>;
}
