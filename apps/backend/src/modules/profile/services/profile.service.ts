import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { BookingService } from '../../booking/services/booking.service';
import { UserService } from '../../user/services/user.service';
import { UpsertTravelerDto } from '../dto/saved-traveler.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
  ) {}

  async getMyProfile(userId: string) {
    const baseUser = await this.userService.getProfile(userId);
    const profile = await this.repository.findByUserId(userId);
    const history = await this.bookingService.getUserBookings(userId);

    return {
      ...baseUser,
      profile,
      travelHistory: history,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    await this.userService.findOne(userId);
    return this.repository.upsert(userId, dto);
  }

  async addTraveler(userId: string, dto: UpsertTravelerDto) {
    const duplicate = await this.repository.findTravelerByPassport(userId, dto.passportNumber);
    if (duplicate) {
      throw new BadRequestException('Traveler with this passport already saved');
    }
    return this.repository.addTraveler(userId, dto);
  }

  async updateTraveler(userId: string, travelerId: string, dto: UpsertTravelerDto) {
    const traveler = await this.repository.updateTraveler(userId, travelerId, dto);
    if (!traveler) {
      throw new NotFoundException('Traveler not found');
    }
    return traveler;
  }

  listTravelers(userId: string) {
    return this.repository.listTravelers(userId);
  }

  async deleteTraveler(userId: string, travelerId: string) {
    const deleted = await this.repository.deleteTraveler(userId, travelerId);
    if (!deleted) {
      throw new NotFoundException('Traveler not found');
    }
    return { deleted: true };
  }
}
