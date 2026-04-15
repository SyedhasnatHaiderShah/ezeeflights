import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({ format: 'uuid', description: 'Payment UUID to refund' })
  @IsUUID()
  paymentId!: string;

  @ApiPropertyOptional({ example: 50.00, description: 'Partial refund amount (omit for full refund)', minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
