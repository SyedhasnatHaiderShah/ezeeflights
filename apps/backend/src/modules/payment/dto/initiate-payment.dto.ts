import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentProvider } from '../entities/payment.entity';

export class InitiatePaymentDto {
  @IsUUID()
  bookingId!: string;

  @IsEnum(['STRIPE', 'PAYTABS', 'TABBY', 'TAMARA'])
  provider!: PaymentProvider;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @IsString()
  successUrl!: string;

  @IsString()
  failureUrl!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
  @IsOptional()
  @IsNumber()
  @Min(0)
  useWalletAmount?: number;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

