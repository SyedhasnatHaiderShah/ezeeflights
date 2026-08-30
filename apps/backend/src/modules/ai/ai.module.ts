import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HybridEngineModule } from '../hybrid-engine/hybrid.module';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';
import { GeminiService } from './services/gemini.service';
import { OpenaiService } from './services/openai.service';

@Module({
  imports: [ConfigModule, HybridEngineModule],
  controllers: [AiController],
  providers: [AiService, GeminiService, OpenaiService],
  exports: [GeminiService, OpenaiService],
})
export class AiModule {}
