import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { RecentSearchRepository } from './repositories/recent-search.repository';
import { PostgresClient } from '../../database/postgres.client';

@Module({
  imports: [AuthModule],
  controllers: [UserController, UsersController],
  providers: [UserService, UserRepository, RecentSearchRepository, PostgresClient],
  exports: [UserService, UserRepository, RecentSearchRepository],
})
export class UserModule {}
