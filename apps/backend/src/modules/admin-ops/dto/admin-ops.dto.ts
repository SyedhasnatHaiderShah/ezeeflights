import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';

export class DateFilterDto {
  @ApiPropertyOptional({ example: '2025-08-01T00:00:00Z', description: 'Filter start date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiPropertyOptional({ example: '2025-08-31T23:59:59Z', description: 'Filter end date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  to?: string;

  @ApiPropertyOptional({ example: 'MENA', description: 'Region filter' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'flights', description: 'Module filter' })
  @IsOptional()
  @IsString()
  module?: string;
}

export class TrendFilterDto extends DateFilterDto {
  @ApiPropertyOptional({ enum: ['hour', 'day', 'week'], description: 'Data granularity for trend analysis' })
  @IsOptional()
  @IsIn(['hour', 'day', 'week'])
  granularity?: 'hour' | 'day' | 'week';
}
