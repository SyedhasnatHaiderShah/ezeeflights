import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @ApiPropertyOptional({ example: 'pi_3NxJRu...', description: 'Stripe payment intent ID' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}
