import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateHoldDestinationDto {
  @ApiProperty({ example: "DXB", description: "Destination airport/city code" })
  @IsString()
  @MaxLength(10)
  hold_destination!: string;
}

export class CreateHoldOriginDto {
  @ApiProperty({ example: "LHE", description: "Origin airport/city code" })
  @IsString()
  @MaxLength(10)
  hold_orgin!: string;
}

export class CreateClickDetailDto {
  @ApiProperty({
    description: "Arbitrary JSON payload describing the click event",
    example: { route: "LHE-DXB", action: "search" },
  })
  log!: unknown;

  @ApiPropertyOptional({ example: "203.0.113.5", description: "Client IP" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  ip?: string;
}
