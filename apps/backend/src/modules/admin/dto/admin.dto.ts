import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum AdminPermissionAction {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  CONFIGURE = 'CONFIGURE',
}

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class CreateRolePermissionDto {
  @IsString()
  @IsNotEmpty()
  module!: string;

  @IsEnum(AdminPermissionAction)
  action!: AdminPermissionAction;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionDto)
  permissions!: CreateRolePermissionDto[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRolePermissionDto)
  permissions?: CreateRolePermissionDto[];
}

export class AssignRoleDto {
  @IsUUID()
  roleId!: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateSettingsDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsObject()
  value!: Record<string, unknown>;
}
