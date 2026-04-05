import { IsEnum, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  bookingId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(['USD', 'AED', 'EUR', 'GBP'])
  currency!: 'USD' | 'AED' | 'EUR' | 'GBP';

  @IsString()
  provider!: string;
}
