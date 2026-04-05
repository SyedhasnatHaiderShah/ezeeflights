import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from '../services/ai.service';
import { AssistantPromptDto } from '../dto/assistant.dto';

@ApiTags('ai')
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly service: AiService) {}

  @Post('assistant')
  assistant(@Body() body: AssistantPromptDto) {
    return this.service.assistant(body.prompt);
  }

  @Get('search')
  naturalSearch(@Query('prompt') prompt: string) {
    return this.service.naturalLanguageSearch(prompt ?? '');
  }

  @Get('price-prediction')
  prediction(@Query('route') route: string) {
    return this.service.pricePrediction(route ?? 'DXB-LHR');
  }
}
