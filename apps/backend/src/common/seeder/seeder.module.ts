import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { SeederService } from './seeder.service';

@Module({
  providers: [SeederService, PostgresClient],
  exports: [SeederService],
})
export class SeederModule {}
