import { Module } from '@nestjs/common';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PostgresClient],
  exports: [PaymentService],
})
export class PaymentModule {}
