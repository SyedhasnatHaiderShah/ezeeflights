import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum AdminPermissionAction {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  CONFIGURE = 'CONFIGURE',
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@ezeeflights.com', description: 'Admin email address' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Admin password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class CreateRolePermissionDto {
  @ApiProperty({ example: 'bookings', description: 'Module this permission applies to' })
  @IsString()
  @IsNotEmpty()
  module!: string;

  @ApiProperty({ enum: AdminPermissionAction, description: 'Permission action' })
  @IsEnum(AdminPermissionAction)
  action!: AdminPermissionAction;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Support Agent', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: [CreateRolePermissionDto], description: 'List of permissions for this role' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionDto)
  permissions!: CreateRolePermissionDto[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Senior Support Agent', description: 'Updated role name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: [CreateRolePermissionDto], description: 'Updated permissions list' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionDto)
  permissions?: CreateRolePermissionDto[];
}

export class AssignRoleDto {
  @ApiProperty({ format: 'uuid', description: 'Role UUID to assign to the user' })
  @IsUUID()
  roleId!: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: 'confirmed', description: 'New booking status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: 'object', description: 'Additional booking metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateSettingsDto {
  @ApiProperty({ example: 'maintenance_mode', description: 'Setting key' })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ type: 'object', example: { enabled: true }, description: 'Setting value (JSON object)' })
  @IsObject()
  value!: Record<string, unknown>;
}
