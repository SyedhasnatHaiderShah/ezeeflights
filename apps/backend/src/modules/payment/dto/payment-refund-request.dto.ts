import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaymentRefundRequestDto {
  @ApiPropertyOptional({ example: 50.00, description: 'Partial refund amount (omit for full refund)', minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
