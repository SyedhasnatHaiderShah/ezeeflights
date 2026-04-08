import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { NotificationModule } from '../notification/notification.module';
import { PackageModule } from '../packages/package.module';
import { AiController } from './ai.controller';
import { AiParser } from './ai.parser';
import { AiPromptBuilder } from './ai.prompt.builder';
import { AiRepository } from './ai.repository';
import { AiItineraryService } from './ai.service';

@Module({
  imports: [PackageModule, NotificationModule],
  controllers: [AiController],
  providers: [AiItineraryService, AiPromptBuilder, AiParser, AiRepository, PostgresClient],
})
export class AiItineraryModule {}
