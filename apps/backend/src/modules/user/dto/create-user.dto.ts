import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'P@ssword123', description: 'Password (min 8 characters)', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: '+971501234567', description: 'Phone number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'admin', description: 'User role', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  role?: string;

  @ApiPropertyOptional({ example: 'UAE', description: 'Nationality', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  @ApiPropertyOptional({ example: 'A12345678', description: 'Passport number', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  passportNumber?: string;

  @ApiPropertyOptional({ example: '2030-01-01', description: 'Passport expiry date (ISO string)' })
  @IsOptional()
  @IsString()
  passportExpiry?: string;
}
