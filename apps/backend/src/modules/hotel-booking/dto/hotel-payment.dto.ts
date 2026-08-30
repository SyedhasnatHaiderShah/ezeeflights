import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitiateHotelPaymentDto {
  @ApiProperty({
    example: 'STRIPE',
    description: 'Payment provider to use (STRIPE | PAYTABS | TABBY | TAMARA)',
  })
  @IsString()
  @IsNotEmpty()
  provider!: string;
}

export class ConfirmHotelPaymentDto {
  @ApiProperty({
    example: 'pi_3Nbk...',
    description: 'PaymentIntent id returned by the provider after client-side confirmation',
  })
  @IsString()
  @IsNotEmpty()
  paymentIntentId!: string;

  @ApiProperty({
    example: 'STRIPE',
    description: 'Payment provider used during initiation',
  })
  @IsString()
  @IsNotEmpty()
  provider!: string;
}
