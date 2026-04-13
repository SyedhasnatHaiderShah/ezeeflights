import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class TravelerDto {
  @IsString()
  name!: string;

  @IsDateString()
  dob!: string;

  @IsString()
  passport!: string;
}

export class CalculatePremiumDto {
  @IsUUID()
  planId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TravelerDto)
  travelers!: TravelerDto[];

  @IsOptional()
  @IsBoolean()
  adventureSports?: boolean;
}

export class PurchasePolicyDto extends CalculatePremiumDto {
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsArray()
  destinationCountries?: string[];

  @IsOptional()
  @IsString()
  paymentProvider?: string;
}

export class SubmitClaimDto {
  @IsUUID()
  policyId!: string;

  @IsString()
  claimType!: string;

  @IsString()
  description!: string;

  @IsDateString()
  incidentDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  claimedAmount!: number;

  @IsOptional()
  @IsArray()
  supportingDocuments?: string[];
}
