import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UserController } from "./controllers/user.controller";
import { UsersController } from "./controllers/users.controller";
import { UserService } from "./services/user.service";
import { UserRepository } from "./repositories/user.repository";
import { RecentSearchRepository } from "./repositories/recent-search.repository";
import { MysqlClient } from "../../database/mysql.client";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";

@Module({
  imports: [forwardRef(() => AuthModule), TypeOrmModule.forFeature([User])],
  controllers: [UserController, UsersController],
  providers: [UserService, UserRepository, RecentSearchRepository, MysqlClient],
  exports: [UserService, UserRepository, RecentSearchRepository, TypeOrmModule],
})
export class UserModule {}
