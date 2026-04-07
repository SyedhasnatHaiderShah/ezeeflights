import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertTravelerDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  passportNumber!: string;

  @ApiProperty()
  @IsDateString()
  dob!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nationality!: string;
}
