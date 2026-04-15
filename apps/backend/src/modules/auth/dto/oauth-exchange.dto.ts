import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OauthExchangeDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...', description: '48-character hex OAuth exchange code' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-f0-9]{48}$/i, { message: 'code must be a 48-character hex string' })
  code!: string;
}
