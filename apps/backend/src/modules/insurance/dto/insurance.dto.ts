import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class TravelerDto {
  @ApiProperty({ example: 'John Doe', description: 'Traveler full name' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '1990-05-15', description: 'Date of birth (ISO date string)' })
  @IsDateString()
  dob!: string;

  @ApiProperty({ example: 'A12345678', description: 'Passport number' })
  @IsString()
  passport!: string;
}

export class CalculatePremiumDto {
  @ApiProperty({ format: 'uuid', description: 'Insurance plan UUID' })
  @IsUUID()
  planId!: string;

  @ApiProperty({ example: '2025-08-01', description: 'Coverage start date' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2025-08-10', description: 'Coverage end date' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ type: [TravelerDto], description: 'List of travelers to cover' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TravelerDto)
  travelers!: TravelerDto[];

  @ApiPropertyOptional({ example: false, description: 'Include adventure sports coverage' })
  @IsOptional()
  @IsBoolean()
  adventureSports?: boolean;
}

export class PurchasePolicyDto extends CalculatePremiumDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Related booking UUID' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ type: [String], example: ['AE', 'GB'], description: 'Destination country codes' })
  @IsOptional()
  @IsArray()
  destinationCountries?: string[];

  @ApiPropertyOptional({ example: 'STRIPE', description: 'Payment provider' })
  @IsOptional()
  @IsString()
  paymentProvider?: string;
}

export class SubmitClaimDto {
  @ApiProperty({ format: 'uuid', description: 'Policy UUID to claim against' })
  @IsUUID()
  policyId!: string;

  @ApiProperty({ example: 'medical_emergency', description: 'Type of claim' })
  @IsString()
  claimType!: string;

  @ApiProperty({ example: 'I was hospitalised during my trip...', description: 'Claim description' })
  @IsString()
  description!: string;

  @ApiProperty({ example: '2025-08-03', description: 'Date of incident (ISO date string)' })
  @IsDateString()
  incidentDate!: string;

  @ApiProperty({ example: 1500.00, description: 'Claimed amount in policy currency', minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  claimedAmount!: number;

  @ApiPropertyOptional({ type: [String], example: ['https://...'], description: 'URLs to supporting documents' })
  @IsOptional()
  @IsArray()
  supportingDocuments?: string[];
}
