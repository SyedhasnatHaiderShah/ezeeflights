import { PartialType } from "@nestjs/mapped-types";
import {
  IsIn,
  IsOptional,
  IsString,
} from "class-validator";
import { CreateCheapBidDto } from "./create-cheap-bid.dto";

export class UpdateCheapBidDto extends PartialType(CreateCheapBidDto) {
  @IsOptional()
  @IsString()
  @IsIn(["active", "expired", "booked", "refunded", "cancelled"])
  status?: string;
}
