import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingModule } from '../booking/booking.module';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { ProfileController } from './controllers/profile.controller';
import { ProfileRepository } from './repositories/profile.repository';
import { ProfileService } from './services/profile.service';
import { SavedTraveler } from './entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavedTraveler]),
    UserModule,
    forwardRef(() => BookingModule),
    NotificationModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
  exports: [ProfileService],
})
export class ProfileModule {}

