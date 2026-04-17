import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [AuthModule],
  controllers: [UserController, UsersController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
