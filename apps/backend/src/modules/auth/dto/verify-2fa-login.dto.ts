import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class Verify2faLoginDto {
  @ApiProperty({ description: 'Pending 2FA token returned from the login endpoint' })
  @IsNotEmpty()
  @IsString()
  pendingToken!: string;

  @ApiProperty({ example: '123456', description: 'TOTP code from authenticator app', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code!: string;
}
