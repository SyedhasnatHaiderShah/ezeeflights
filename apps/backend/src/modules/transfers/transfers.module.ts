import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { UserModule } from '../user/user.module';
import { TransfersController } from './transfers.controller';
import { TransfersRepository } from './transfers.repository';
import { HybridFlightTrackingService, TransfersService } from './transfers.service';

@Module({
  imports: [UserModule],
  controllers: [TransfersController],
  providers: [TransfersService, TransfersRepository, HybridFlightTrackingService, MysqlClient],
})
export class TransfersModule {}
