import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { AuthController } from "./controllers/auth.controller";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";
import { TwoFactorService } from "./services/two-factor.service";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RolesGuard } from "./guards/roles.guard";

// import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") || "replace-me",
        signOptions: {
          expiresIn: config.get<string>("JWT_EXPIRES_IN") || "2h",
        },
      }),
    }),
    // forwardRef(() => NotificationModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TwoFactorService,
    AuthRepository,
    JwtStrategy,
    GoogleStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    AuthRepository,
    RolesGuard,
    PermissionsGuard,
    TypeOrmModule,
  ],
})
export class AuthModule {}
