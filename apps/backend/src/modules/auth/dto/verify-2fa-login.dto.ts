import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class Verify2faLoginDto {
  @IsNotEmpty()
  @IsString()
  pendingToken!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  code!: string;
}
