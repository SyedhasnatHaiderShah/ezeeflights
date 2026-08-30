import { Module } from '@nestjs/common';
import { SpanishJetcostMysqlClient } from '../../database/spanish-jetcost-mysql.client';
import { UsaMarkupService } from './usa-markup.service';
import { UsaMarkupRepository } from './usa-markup.repository';

@Module({
  providers: [UsaMarkupService, UsaMarkupRepository, SpanishJetcostMysqlClient],
  exports: [UsaMarkupService],
})
export class UsaMarkupModule {}
