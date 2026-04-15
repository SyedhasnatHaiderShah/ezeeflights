import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentProvider } from '../entities/payment.entity';

export class InitiatePaymentDto {
  @ApiProperty({ format: 'uuid', description: 'Booking UUID to pay for' })
  @IsUUID()
  bookingId!: string;

  @ApiProperty({ enum: ['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'], description: 'Payment provider' })
  @IsEnum(['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'])
  provider!: PaymentProvider;

  @ApiProperty({ example: 299.99, description: 'Amount to charge', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: ['USD', 'AED', 'EUR', 'GBP'], description: 'Payment currency' })
  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @ApiProperty({ example: 'https://app.example.com/success', description: 'Redirect URL on success' })
  @IsString()
  successUrl!: string;

  @ApiProperty({ example: 'https://app.example.com/failure', description: 'Redirect URL on failure' })
  @IsString()
  failureUrl!: string;

  @ApiPropertyOptional({ type: 'object', description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 50, description: 'Amount to deduct from wallet', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  useWalletAmount?: number;

  @ApiPropertyOptional({ example: 'pm_1234', description: 'Saved payment method ID' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

