import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  passportNumber?: string;

  @IsOptional()
  @IsString()
  passportExpiry?: string;
}
