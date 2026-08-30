import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class Verify2faSetupDto {
  @ApiProperty({ example: '123456', description: 'TOTP code from authenticator app to confirm setup', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code!: string;
}
