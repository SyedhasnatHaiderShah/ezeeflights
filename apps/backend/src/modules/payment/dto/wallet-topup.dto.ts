import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class WalletTopUpDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @IsString()
  paymentMethodId!: string;
}
