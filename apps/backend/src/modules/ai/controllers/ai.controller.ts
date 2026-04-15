import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiService } from '../services/ai.service';
import { AssistantPromptDto } from '../dto/assistant.dto';

@ApiTags('AI')
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly service: AiService) {}

  @ApiOperation({ summary: 'Chat with the AI travel assistant' })
  @ApiResponse({ status: 200, description: 'Assistant response' })
  @ApiResponse({ status: 400, description: 'Prompt too short' })
  @Post('assistant')
  assistant(@Body() body: AssistantPromptDto) {
    return this.service.assistant(body.prompt);
  }

  @ApiOperation({ summary: 'Natural language flight/hotel search' })
  @ApiQuery({ name: 'prompt', description: 'Natural language search query' })
  @ApiResponse({ status: 200, description: 'Parsed search results' })
  @Get('search')
  naturalSearch(@Query('prompt') prompt: string) {
    return this.service.naturalLanguageSearch(prompt ?? '');
  }

  @ApiOperation({ summary: 'AI price prediction for a route' })
  @ApiQuery({ name: 'route', description: 'Route in IATA format e.g. DXB-LHR' })
  @ApiResponse({ status: 200, description: 'Price prediction data' })
  @Get('price-prediction')
  prediction(@Query('route') route: string) {
    return this.service.pricePrediction(route ?? 'DXB-LHR');
  }
}
