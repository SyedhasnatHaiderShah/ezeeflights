import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MysqlClient } from '../../database/mysql.client';
import { AuthModule } from '../auth/auth.module';
import { PublicModule } from '../public/public.module';
import { AdminController } from './admin.controller';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';
import { AdminRbacGuard } from './rbac.middleware';
import { UsaMarkupModule } from '../usa-markup/usa-markup.module';
import { UsaMarkupController } from '../usa-markup/usa-markup.controller';
import { JetcostConfigModule } from '../jetcost-config/jetcost-config.module';
import {
  HoldDestinationController,
  HoldOriginController,
} from '../jetcost-config/jetcost-config.controller';
import { WorldrixCrmModule } from '../worldrix-crm/worldrix-crm.module';
import { WorldrixCrmController } from '../worldrix-crm/worldrix-crm.controller';
import { CheapBidModule } from '../cheap-bid/cheap-bid.module';
import { CheapBidAdminController } from '../cheap-bid/cheap-bid-admin.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    AuthModule,
    PublicModule,
    UserModule,
    UsaMarkupModule,
    JetcostConfigModule,
    WorldrixCrmModule,
    CheapBidModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'replace-me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1h' },
    }),
  ],
  controllers: [
    AdminController,
    UsaMarkupController,
    HoldDestinationController,
    HoldOriginController,
    WorldrixCrmController,
    CheapBidAdminController,
  ],
  providers: [AdminService, AdminRepository, AuditService, AdminRbacGuard, MysqlClient],
  exports: [AdminService, AuditService, AdminRepository, AdminRbacGuard, UsaMarkupModule],
})
export class AdminModule {}
