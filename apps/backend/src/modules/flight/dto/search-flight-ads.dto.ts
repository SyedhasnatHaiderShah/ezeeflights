import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchFlightsDto } from './search-flights.dto';

export class SearchFlightAdsDto extends SearchFlightsDto {
  /** Show direct flights only */
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  directFlightsOnly?: boolean;

  /** Number of ad results to return */
  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  adCount?: number = 5;

  /** Discount percentage to apply (default 0.10 = 10%) */
  @ApiPropertyOptional({ example: 0.10, default: 0.10 })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  discountPct?: number = 0.10;
}
