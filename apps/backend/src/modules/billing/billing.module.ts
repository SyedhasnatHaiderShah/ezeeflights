import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { LegacyBillingController } from './billing.routes';
import { BillingEventsListener } from './billing-events.listener';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './invoice.repository';
import { InvoiceService } from './invoice.service';
import { PdfGeneratorService } from './pdfGenerator.service';

@Module({
  imports: [UserModule, NotificationModule],
  controllers: [InvoiceController, LegacyBillingController],
  providers: [InvoiceService, InvoiceRepository, PdfGeneratorService, BillingEventsListener, PostgresClient],
  exports: [InvoiceService],
})
export class BillingModule {}
