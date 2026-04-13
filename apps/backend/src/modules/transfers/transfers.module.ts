import { Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { UserModule } from '../user/user.module';
import { TransfersController } from './transfers.controller';
import { TransfersRepository } from './transfers.repository';
import { HybridFlightTrackingService, TransfersService } from './transfers.service';

@Module({
  imports: [UserModule],
  controllers: [TransfersController],
  providers: [TransfersService, TransfersRepository, HybridFlightTrackingService, PostgresClient],
})
export class TransfersModule {}
