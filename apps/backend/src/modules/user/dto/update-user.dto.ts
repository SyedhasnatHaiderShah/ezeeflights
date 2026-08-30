import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Optional lookup — must match authenticated user (profile PATCH only)',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: 'Optional lookup — must match authenticated user (profile PATCH only)',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Optional lookup — must match authenticated user email (profile PATCH only)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Michael', description: 'Middle name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name (deprecated, use firstName/lastName)', maxLength: 100 })
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

  @ApiPropertyOptional({ example: '1990-05-15', description: 'Date of birth (ISO date)' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'] })
  @Transform(emptyToUndefined)
  @IsOptional()
  @IsIn(['MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED'])
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'UNSPECIFIED';
}
