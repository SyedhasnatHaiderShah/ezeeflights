import { forwardRef, Module } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { BookingModule } from '../booking/booking.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ProfileController } from './controllers/profile.controller';
import { ProfileRepository } from './repositories/profile.repository';
import { ProfileService } from './services/profile.service';

@Module({
  imports: [UserModule, LoyaltyModule, forwardRef(() => BookingModule), NotificationModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, PostgresClient],
  exports: [ProfileService],
})
export class ProfileModule {}
