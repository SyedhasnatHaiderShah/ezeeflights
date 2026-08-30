import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { MysqlClient } from '../../database/mysql.client';
import { TravelDocumentsController } from './travel-documents.controller';
import { TravelDocumentsRepository } from './travel-documents.repository';
import { TravelDocumentsService } from './travel-documents.service';

@Module({
  imports: [NotificationModule],
  controllers: [TravelDocumentsController],
  providers: [TravelDocumentsService, TravelDocumentsRepository, MysqlClient],
  exports: [TravelDocumentsService],
})
export class TravelDocumentsModule {}
