import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchHotelsDto {
  @IsString()
  city!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minStars?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
