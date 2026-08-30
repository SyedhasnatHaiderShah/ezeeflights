import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { BookingService } from "../../booking/services/booking.service";
import { UserService } from "../../user/services/user.service";
import { UpsertTravelerDto } from "../dto/saved-traveler.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { ProfileRepository } from "../repositories/profile.repository";
import { NotificationService } from "../../notification/services/notification.service";

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    private readonly notificationService: NotificationService,
  ) {}

  async getMyProfile(userId: string) {
    const [baseUser, profile, history, travelers] = await Promise.all([
      this.userService.getProfile(userId),
      this.repository.findByUserId(userId),
      this.bookingService.getUserBookings(userId),
      this.repository.listTravelers(userId),
    ]);

    const isComplete = !!(
      baseUser.firstName &&
      baseUser.lastName &&
      baseUser.phone &&
      baseUser.nationality &&
      baseUser.passportNumber
    );

    if (!isComplete) {
      await this.notificationService.triggerIncompleteProfileNotification(
        userId,
      );
    }

    return {
      ...baseUser,
      profile,
      travelers,
      travelHistory: history,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateProfileDto) {
    await this.userService.findOne(userId);

    // Sync relevant fields to the core users table
    await this.userService.update(userId, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      nationality: dto.nationality,
      passportNumber: dto.passportNumber,
      passportExpiry:
        dto.passportExpiry && dto.passportExpiry !== ""
          ? dto.passportExpiry
          : undefined,
    });

    const { id, userId: dtoUserId, createdAt, updatedAt, ...dtoRest } = dto;
    const cleanDto = {
      ...dtoRest,
      dateOfBirth:
        dto.dateOfBirth && dto.dateOfBirth !== "" ? dto.dateOfBirth : null,
      passportExpiry:
        dto.passportExpiry && dto.passportExpiry !== ""
          ? dto.passportExpiry
          : null,
    };

    return this.repository.upsert(userId, cleanDto);
  }

  async addTraveler(userId: string, dto: UpsertTravelerDto) {
    const duplicate = await this.repository.findTravelerByPassport(
      userId,
      dto.passportNumber,
    );
    if (duplicate) {
      throw new BadRequestException(
        "Traveler with this passport already saved",
      );
    }
    return this.repository.addTraveler(userId, dto);
  }

  async updateTraveler(
    userId: string,
    travelerId: string,
    dto: UpsertTravelerDto,
  ) {
    const traveler = await this.repository.updateTraveler(
      userId,
      travelerId,
      dto,
    );
    if (!traveler) {
      throw new NotFoundException("Traveler not found");
    }
    return traveler;
  }

  listTravelers(userId: string) {
    return this.repository.listTravelers(userId);
  }

  async deleteTraveler(userId: string, travelerId: string) {
    const deleted = await this.repository.deleteTraveler(userId, travelerId);
    if (!deleted) {
      throw new NotFoundException("Traveler not found");
    }
    return { deleted: true };
  }
}
