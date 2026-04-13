import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PostgresClient } from '../../database/postgres.client';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import { AdminRbacGuard } from './rbac.middleware';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'replace-me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, AuditService, AdminRbacGuard, PostgresClient],
  exports: [AdminService, AuditService, AdminRepository, AdminRbacGuard],
})
export class AdminModule {}
