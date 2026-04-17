import { Module } from '@nestjs/common';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';
import { NlpSearchService } from './nlp-search.service';
import { ConversationalAgentService } from './conversational-agent.service';
import { PersonalizationService } from './personalization.service';
import { FlightModule } from '../flight/flight.module';
import { HotelModule } from '../hotel/hotel.module';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  imports: [FlightModule, HotelModule],
  controllers: [AiController],
  providers: [AiService, NlpSearchService, ConversationalAgentService, PersonalizationService, PostgresClient],
})
export class AiModule {}
