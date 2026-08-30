import { Module } from '@nestjs/common';
import { MysqlClient } from '../../database/mysql.client';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';
import { SupportService } from './support.service';

@Module({
  imports: [AuthModule, UserModule, NotificationModule],
  controllers: [SupportController],
  providers: [SupportService, SupportRepository, MysqlClient],
  exports: [SupportService],
})
export class SupportModule {}
