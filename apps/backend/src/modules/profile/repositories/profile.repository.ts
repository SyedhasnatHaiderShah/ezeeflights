import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../user/entities/user.entity";
import {
  SavedTraveler,
  SavedTravelerEntity,
} from "../entities/profile.entity";

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SavedTraveler)
    private readonly travelerRepo: Repository<SavedTraveler>,
  ) {}

  findByUserId(userId: string): Promise<User | null> {
    return this.userRepo.findOneBy({ id: userId });
  }

  async upsert(
    userId: string,
    payload: any,
  ): Promise<any> {
    let user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    if (payload.firstName !== undefined) user.firstName = payload.firstName;
    if (payload.lastName !== undefined) user.lastName = payload.lastName;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.dateOfBirth !== undefined) user.dateOfBirth = payload.dateOfBirth;
    if (payload.gender !== undefined) user.gender = payload.gender;
    if (payload.passportNumber !== undefined) user.passportNumber = payload.passportNumber;
    if (payload.nationality !== undefined) user.nationality = payload.nationality;
    if (payload.middleName !== undefined) user.middleName = payload.middleName;
    if (payload.passportExpiry !== undefined) user.passportExpiry = payload.passportExpiry;

    return this.userRepo.save(user);
  }

  async addTraveler(
    userId: string,
    payload: any,
  ): Promise<SavedTravelerEntity | null> {
    const traveler = this.travelerRepo.create({
      userId,
      fullName: payload.fullName,
      passportNumber: payload.passportNumber,
      dob: payload.dob,
      nationality: payload.nationality,
      gender: payload.gender ?? null,
    });
    return this.travelerRepo.save(traveler);
  }

  async updateTraveler(
    userId: string,
    travelerId: string,
    payload: any,
  ): Promise<SavedTravelerEntity | null> {
    const traveler = await this.travelerRepo.findOneBy({ id: travelerId, userId });
    if (!traveler) return null;

    traveler.fullName = payload.fullName;
    traveler.passportNumber = payload.passportNumber;
    traveler.dob = payload.dob;
    traveler.nationality = payload.nationality;
    traveler.gender = payload.gender ?? null;

    return this.travelerRepo.save(traveler);
  }

  async deleteTraveler(userId: string, travelerId: string): Promise<{ id: string } | null> {
    const traveler = await this.travelerRepo.findOneBy({ id: travelerId, userId });
    if (!traveler) return null;
    await this.travelerRepo.delete({ id: travelerId, userId });
    return { id: travelerId };
  }

  listTravelers(userId: string): Promise<SavedTravelerEntity[]> {
    return this.travelerRepo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  findTravelerByPassport(userId: string, passportNumber: string): Promise<{ id: string } | null> {
    return this.travelerRepo.findOne({
      select: { id: true },
      where: { userId, passportNumber },
    });
  }
}

