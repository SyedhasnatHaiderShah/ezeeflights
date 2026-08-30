import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token (omit to use cookie)' })
  @IsOptional()
  @IsString()
  @MinLength(20)
  refreshToken?: string;
}
