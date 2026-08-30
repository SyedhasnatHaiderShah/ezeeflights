import { Body, Controller, Get, Post, Query, BadRequestException, InternalServerErrorException, Logger } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AiService } from "../services/ai.service";
import { GeminiService } from "../services/gemini.service";
import { OpenaiService } from "../services/openai.service";
import { AssistantPromptDto } from "../dto/assistant.dto";

@ApiTags("AI")
@Controller({ path: "ai", version: "1" })
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly service: AiService,
    private readonly geminiService: GeminiService,
    private readonly openaiService: OpenaiService,
  ) {}

  @ApiOperation({ summary: "Extract booking data from natural language" })
  @ApiResponse({ status: 200, description: "Structured booking data" })
  @Post("extract-booking")
  async extractBooking(@Body() body: { prompt: string }) {
    this.logger.log("Attempting booking extraction using Gemini...");
    let result: any = null;
    let geminiError: string | null = null;

    try {
      result = await this.geminiService.extractBookingData(body.prompt);
    } catch (err: any) {
      geminiError = err?.message || String(err);
    }

    const hasError = result && result._debug_error;
    const isGeminiFailed = !result || geminiError || hasError;

    if (isGeminiFailed) {
      const reason = geminiError || result?._debug_error || "Unknown Gemini error";
      this.logger.warn(`Gemini extraction failed (Reason: ${reason}). Falling back to OpenAI...`);
      try {
        const openAiResult = await this.openaiService.extractBookingData(body.prompt);
        this.logger.log("Booking extraction successfully returned from OpenAI fallback.");
        return {
          ...openAiResult,
          _provider: "OpenAI",
        };
      } catch (openAiErr: any) {
        this.logger.error(`OpenAI fallback also failed: ${openAiErr.message}`);
        return result || {
          status: "incomplete",
          question: "AI assistant is temporarily busy. Please try again in a moment.",
          data: {},
        };
      }
    }

    this.logger.log("Booking extraction successfully returned from Gemini.");
    return {
      ...result,
      _provider: "Gemini",
    };
  }

  @ApiOperation({ summary: "Chat with the AI travel assistant" })
  @ApiResponse({ status: 200, description: "Assistant response" })
  @ApiResponse({ status: 400, description: "Prompt too short" })
  @Post("assistant")
  assistant(@Body() body: AssistantPromptDto) {
    return this.service.assistant(body.prompt);
  }

  @ApiOperation({ summary: "Natural language flight/hotel search" })
  @ApiQuery({ name: "prompt", description: "Natural language search query" })
  @ApiResponse({ status: 200, description: "Parsed search results" })
  @Get("search")
  naturalSearch(@Query("prompt") prompt: string) {
    return this.service.naturalLanguageSearch(prompt ?? "");
  }

  @ApiOperation({ summary: "AI price prediction for a route" })
  @ApiQuery({ name: "route", description: "Route in IATA format e.g. DXB-LHR" })
  @ApiResponse({ status: 200, description: "Price prediction data" })
  @Get("price-prediction")
  prediction(@Query("route") route: string) {
    if (!route) {
      throw new BadRequestException("Route query parameter is required");
    }
    return this.service.pricePrediction(route);
  }

  @ApiOperation({ summary: "Get destination insights by AI" })
  @ApiQuery({ name: "destination", description: "Destination code, e.g. DXB" })
  @ApiResponse({ status: 200, description: "Destination insights" })
  @Get("destination-insights")
  async getDestinationInsights(@Query("destination") destination: string) {
    if (!destination) {
      throw new BadRequestException("Destination query parameter is required");
    }

    const data = await this.service.getDestinationInsights(destination);

    if (!data) {
      throw new InternalServerErrorException(
        `Failed to fetch destination insights for ${destination} from AI services`,
      );
    }
    return { success: true, data };
  }

  @ApiOperation({ summary: "Get full city travel insights by AI" })
  @ApiQuery({ name: "city", description: "City display name, e.g. Dubai" })
  @ApiQuery({ name: "slug", required: false, description: "URL slug for cache key, e.g. dubai" })
  @ApiResponse({ status: 200, description: "City travel insights" })
  @Get("city-insights")
  async getCityInsights(
    @Query("city") city: string,
    @Query("slug") slug?: string,
  ) {
    if (!city) {
      throw new BadRequestException("City query parameter is required");
    }

    const data = await this.service.getCityInsights(city, slug);

    if (!data) {
      throw new InternalServerErrorException(
        `Failed to fetch city insights for ${city} from AI services`,
      );
    }

    return { success: true, data };
  }
}
