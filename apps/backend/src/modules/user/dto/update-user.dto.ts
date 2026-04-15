import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '+971501234567', description: 'Phone number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

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
