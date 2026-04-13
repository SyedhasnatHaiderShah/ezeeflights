import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class EarnPointsDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ['flight', 'hotel', 'car', 'package'], default: 'flight' })
  @IsIn(['flight', 'hotel', 'car', 'package'])
  bookingType!: 'flight' | 'hotel' | 'car' | 'package';

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  bookingTotal!: number;

  @ApiProperty({ default: 'USD' })
  @IsString()
  currency!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
