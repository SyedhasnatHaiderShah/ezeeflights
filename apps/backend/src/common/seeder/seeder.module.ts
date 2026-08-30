import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { SeederService } from './seeder.service';

@Module({
  providers: [SeederService, MysqlClient],
  exports: [SeederService],
})
export class SeederModule {}
