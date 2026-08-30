import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class WalletTopUpDto {
  @ApiProperty({ example: 100.00, description: 'Amount to add to wallet', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: ['USD', 'AED', 'EUR', 'GBP'], description: 'Currency' })
  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @ApiProperty({ example: 'pm_1234', description: 'Saved payment method ID to charge' })
  @IsString()
  paymentMethodId!: string;
}
