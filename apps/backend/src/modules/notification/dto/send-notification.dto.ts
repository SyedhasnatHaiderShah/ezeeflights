import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsIn, IsObject, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class SendNotificationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'WHATSAPP'] })
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP'])
  type!: NotificationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  templateName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/)
  phone?: string;

  @ApiProperty({ type: 'object' })
  @IsObject()
  payload!: Record<string, unknown>;
}

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'WHATSAPP'] })
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP'])
  type!: NotificationType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  variables!: string[];
}
