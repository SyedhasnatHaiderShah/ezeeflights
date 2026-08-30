import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum PromotionKind {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export class PromotionUpsertDto {
  @ApiProperty({ example: 'WELCOME10', description: 'Coupon or campaign code' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Welcome bonus', description: 'Human-readable title' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: '10% off your first booking', description: 'Description shown in checkout and admin' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: PromotionKind, description: 'Discount type' })
  @IsEnum(PromotionKind)
  kind!: PromotionKind;

  @ApiProperty({ example: 10, description: 'Discount value. Percentage for PERCENT, currency amount for FIXED', minimum: 0 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ description: 'Whether the promotion is active' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00.000Z', description: 'Promotion start date/time' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z', description: 'Promotion end date/time' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ example: 250, description: 'Minimum subtotal before discount applies', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional({ example: 4, description: 'Minimum traveler count before discount applies', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minTravelers?: number;

  @ApiPropertyOptional({ description: 'Only valid for a user making their first booking' })
  @IsOptional()
  @IsBoolean()
  firstBookingOnly?: boolean;

  @ApiPropertyOptional({ description: 'Only valid for logged-in members' })
  @IsOptional()
  @IsBoolean()
  memberOnly?: boolean;

  @ApiPropertyOptional({ example: 'AIRLINE_PARTNER', description: 'Optional partner code required to apply the promotion' })
  @IsOptional()
  @IsString()
  partnerCode?: string;

  @ApiPropertyOptional({ example: 'EID', description: 'Seasonal campaign tag' })
  @IsOptional()
  @IsString()
  campaignTag?: string;

  @ApiPropertyOptional({ description: 'Whether the promotion is automatically applied when eligible' })
  @IsOptional()
  @IsBoolean()
  autoApply?: boolean;

  @ApiPropertyOptional({ description: 'Whether the promotion is a flash sale' })
  @IsOptional()
  @IsBoolean()
  flashSale?: boolean;

  @ApiPropertyOptional({ example: 250, description: 'Maximum discount amount if applicable', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Usage limit for the promotion', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 100, description: 'Redeemed count (managed by admin)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  redeemedCount?: number;
}

export class PromotionValidateQueryDto {
  @ApiProperty({ format: 'uuid', description: 'Booking UUID' })
  @IsUUID()
  bookingId!: string;

  @ApiPropertyOptional({ example: 'WELCOME10', description: 'Promo code typed by the user' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'AIRLINE_PARTNER', description: 'Partner code to match direct-rate promotions' })
  @IsOptional()
  @IsString()
  partnerCode?: string;

  @ApiPropertyOptional({ example: 3, description: 'Optional traveler count override', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  travelers?: number;

  @ApiPropertyOptional({ example: 'AED', description: 'Optional currency hint' })
  @IsOptional()
  @IsString()
  currency?: string;
}
