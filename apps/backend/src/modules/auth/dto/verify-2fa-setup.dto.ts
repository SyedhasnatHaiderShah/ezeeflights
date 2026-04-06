import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class Verify2faSetupDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code!: string;
}
