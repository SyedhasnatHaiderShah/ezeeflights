import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, PostgresClient],
  exports: [UserService],
})
export class UserModule {}
