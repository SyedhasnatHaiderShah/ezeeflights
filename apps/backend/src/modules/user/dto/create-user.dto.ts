import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;

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
