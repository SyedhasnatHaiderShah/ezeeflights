import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
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
  providers: [AiItineraryService, AiPromptBuilder, AiParser, AiRepository, MysqlClient],
})
export class AiItineraryModule {}
