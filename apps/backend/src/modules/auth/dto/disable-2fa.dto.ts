import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class Disable2faDto {
  /** Required when the account has a password; omit for OAuth-only accounts. */
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code!: string;
}
