import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddAncillaryItemDto {
  @ApiProperty({ format: 'uuid', description: 'Ancillary option UUID' })
  @IsUUID()
  ancillaryId!: string;

  @ApiProperty({ example: 0, description: 'Zero-based passenger index', minimum: 0 })
  @IsInt()
  @Min(0)
  passengerIndex!: number;

  @ApiProperty({ example: 1, description: 'Quantity to add', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class AddAncillaryDto {
  @ApiProperty({ type: [AddAncillaryItemDto], description: 'Ancillary items to add' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddAncillaryItemDto)
  items!: AddAncillaryItemDto[];
}
