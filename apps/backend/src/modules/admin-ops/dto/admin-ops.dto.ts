import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';

export class DateFilterDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  module?: string;
}

export class TrendFilterDto extends DateFilterDto {
  @IsOptional()
  @IsIn(['hour', 'day', 'week'])
  granularity?: 'hour' | 'day' | 'week';
}
