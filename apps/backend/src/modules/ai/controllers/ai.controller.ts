import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiService } from '../services/ai.service';
import { AssistantPromptDto, AiChatDto, AiSearchDto } from '../dto/assistant.dto';
import { NlpSearchService } from '../nlp-search.service';
import { ConversationalAgentService } from '../conversational-agent.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PersonalizationService } from '../personalization.service';

interface AuthenticatedRequest {
  user?: { userId: string };
}

@ApiTags('ai')
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(
    private readonly service: AiService,
    private readonly nlpSearchService: NlpSearchService,
    private readonly conversationalAgent: ConversationalAgentService,
    private readonly personalizationService: PersonalizationService,
  ) {}

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

  @Post('search')
  async aiSearch(@Body() body: AiSearchDto, @Req() req: AuthenticatedRequest) {
    const intent = await this.nlpSearchService.parseNaturalLanguageQuery(body.query, req.user?.userId);
    const results = await this.nlpSearchService.searchFromIntent(intent);
    return { intent, results };
  }

  @Post('chat')
  async chat(@Body() body: AiChatDto, @Req() req: AuthenticatedRequest) {
    const response = await this.conversationalAgent.chat(body.sessionId, body.message, req.user?.userId, body.context);
    return { ...response, sessionId: body.sessionId };
  }

  @Get('chat/:sessionId')
  history(@Param('sessionId') sessionId: string) {
    return this.conversationalAgent.getConversationHistory(sessionId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('recommendations/destinations')
  destinations(@Req() req: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.personalizationService.getPersonalizedDestinations(req.user!.userId, Number(limit ?? 5));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('recommendations/attractions/:destinationId')
  async attractions(@Req() req: AuthenticatedRequest, @Param('destinationId') destinationId: string) {
    return this.personalizationService.rankAttractions(req.user!.userId, [
      { id: `${destinationId}-1`, name: 'Beach Walk', tags: ['beach', 'culture'] },
      { id: `${destinationId}-2`, name: 'Old Town Food Tour', tags: ['culture', 'food'] },
      { id: `${destinationId}-3`, name: 'Night Market', tags: ['nightlife', 'food'] },
    ]);
  }
}
