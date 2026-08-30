import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { PaymentModule } from '../payment/payment.module';
import { InsuranceController } from './insurance.controller';
import { InsuranceRepository } from './insurance.repository';
import { InsuranceService } from './insurance.service';

@Module({
  imports: [PaymentModule],
  controllers: [InsuranceController],
  providers: [InsuranceService, InsuranceRepository, MysqlClient],
})
export class InsuranceModule {}
