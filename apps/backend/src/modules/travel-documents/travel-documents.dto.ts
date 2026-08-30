import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import type { TravelDocumentType } from './travel-documents.entity';

export const travelDocumentTypes: TravelDocumentType[] = ['PASSPORT', 'NATIONAL_ID', 'VISA', 'E_TICKET', 'HOTEL_VOUCHER', 'INSURANCE', 'OTHER'];
export const travelShareMethods = ['EMAIL', 'WHATSAPP', 'PDF'] as const;

export type TravelShareMethod = (typeof travelShareMethods)[number];

export class TravelDocumentUploadDto {
  @ApiProperty({ enum: travelDocumentTypes })
  @IsIn(travelDocumentTypes)
  docType!: TravelDocumentType;

  @ApiPropertyOptional({ description: 'Optional booking UUID to attach the document to' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ description: 'Optional saved traveler UUID to attach the document to' })
  @IsOptional()
  @IsUUID()
  travelerId?: string;

  @ApiPropertyOptional({ description: 'Human-readable title for the document' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Issuing country for passports, IDs, or visas' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  issuingCountry?: string;

  @ApiPropertyOptional({ description: 'Destination associated with the document' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  destination?: string;

  @ApiPropertyOptional({ description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes or tags' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class TravelDocumentShareDto {
  @ApiProperty({ enum: travelShareMethods })
  @IsIn(travelShareMethods)
  method!: TravelShareMethod;

  @ApiPropertyOptional({ description: 'Recipient email for email sharing' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Recipient phone number for WhatsApp sharing' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class TravelComplianceCheckDto {
  @ApiPropertyOptional({ description: 'Passport expiry date in ISO format' })
  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @ApiProperty({ description: 'Planned return date in ISO format' })
  @IsDateString()
  returnDate!: string;

  @ApiPropertyOptional({ description: 'Traveler nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ type: [String], description: 'List of destinations in the itinerary' })
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  destinations!: string[];
}

export class TravelDocumentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiPropertyOptional({ enum: travelDocumentTypes })
  @IsOptional()
  @IsIn(travelDocumentTypes)
  docType?: TravelDocumentType;
}
