import { IsObject, IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @IsOptional()
  @IsString()
  signature?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
