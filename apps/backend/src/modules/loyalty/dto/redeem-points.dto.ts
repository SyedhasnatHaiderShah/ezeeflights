import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RedeemPointsDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  points!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
