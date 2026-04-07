import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsUUID()
  paymentId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
