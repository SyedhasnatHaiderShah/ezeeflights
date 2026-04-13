import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddAncillaryItemDto {
  @IsUUID()
  ancillaryId!: string;

  @IsInt()
  @Min(0)
  passengerIndex!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class AddAncillaryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddAncillaryItemDto)
  items!: AddAncillaryItemDto[];
}
