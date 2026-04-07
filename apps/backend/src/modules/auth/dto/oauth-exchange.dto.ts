import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OauthExchangeDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-f0-9]{48}$/i, { message: 'code must be a 48-character hex string' })
  code!: string;
}
