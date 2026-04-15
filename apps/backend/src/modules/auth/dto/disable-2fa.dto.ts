import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class Disable2faDto {
  /** Required when the account has a password; omit for OAuth-only accounts. */
  @ApiPropertyOptional({ description: 'Current account password (required for non-OAuth accounts)' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ example: '123456', description: 'Current TOTP code from authenticator app', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code!: string;
}
