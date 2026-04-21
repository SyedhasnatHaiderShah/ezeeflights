import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { PaymentModule } from '../payment/payment.module';
import { InsuranceController } from './insurance.controller';
import { InsuranceRepository } from './insurance.repository';
import { InsuranceService } from './insurance.service';

@Module({
  imports: [PaymentModule],
  controllers: [InsuranceController],
  providers: [InsuranceService, InsuranceRepository, PostgresClient],
})
export class InsuranceModule {}
