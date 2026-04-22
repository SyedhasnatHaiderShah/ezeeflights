import { Controller, Get, Logger } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PublicAirlinesService } from "./public-airlines.service";

@ApiTags("Public Airlines")
@Controller({ path: "airlines", version: "1" })
export class PublicAirlinesController {
  constructor(private readonly airlinesService: PublicAirlinesService) {}

  @ApiOperation({ summary: "Get all airline partners" })
  @ApiResponse({ status: 200, description: "Returns list of airline partners" })
  @Get()
  getAirlines() {
    Logger.log("GET /v1/airlines called", "PublicAirlinesController");
    return this.airlinesService.getAirlines();
  }
}
