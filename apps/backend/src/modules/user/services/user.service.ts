import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { hashPassword, verifyPassword } from "../../../common/crypto/password";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { User, UserPublicView, UserRecord, UserRole } from "../entities/user.entity";
import { UserRepository } from "../repositories/user.repository";
import { RecentSearchRepository } from "../repositories/recent-search.repository";
import { RecentSearchEntity } from "../entities/recent-search.entity";

type UserUpdatePayload = Parameters<UserRepository["update"]>[1];

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly recentSearchRepository: RecentSearchRepository,
  ) {}

  private formatPassportExpiry(value: Date | null): string | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }

  private toPublicView(row: UserRecord): UserPublicView {
    const parts = [row.firstName, row.lastName].filter(
      (p): p is string => !!p?.trim(),
    );
    const name = parts.join(" ").trim() || row.firstName?.trim() || "";
    return {
      id: row.id,
      email: row.email,
      name: name || row.email,
      hasPassword: !!row.passwordHash,
      firstName: row.firstName,
      middleName: row.middleName,
      lastName: row.lastName,
      oauthProvider: row.oauthProvider,
      preferredCurrency: row.preferredCurrency,
      phone: row.phone,
      dateOfBirth: this.formatPassportExpiry(row.dateOfBirth),
      gender: row.gender,
      role: row.role,
      nationality: row.nationality,
      passportNumber: row.passportNumber,
      passportExpiry: this.formatPassportExpiry(row.passportExpiry),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async getProfile(userId: string): Promise<UserPublicView> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(
        "Session invalid — please sign in again",
      );
    }
    return this.toPublicView(user);
  }

  async findAll(): Promise<UserPublicView[]> {
    const rows = await this.repository.findAll();
    return rows.map((r) => this.toPublicView(r));
  }

  async findOne(id: string): Promise<UserPublicView> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.toPublicView(user);
  }

  async create(dto: CreateUserDto): Promise<UserPublicView> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already exists");
    }

    const passportExpiry = dto.passportExpiry?.trim() || null;
    const row = await this.repository.create({
      email: dto.email.trim().toLowerCase(),
      passwordHash: await hashPassword(dto.password),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone?.trim() || null,
      role: (dto.role?.trim().toUpperCase() as UserRole) || UserRole.USER,
      nationality: dto.nationality?.trim() || null,
      passportNumber: dto.passportNumber?.trim() || null,
      passportExpiry,
    });

    if (!row) {
      throw new NotFoundException("Failed to create user");
    }

    return this.toPublicView(row);
  }

  private buildUpdatePayload(dto: UpdateUserDto): UserUpdatePayload {
    const payload: UserUpdatePayload = {};

    if (dto.firstName !== undefined) {
      payload.firstName = dto.firstName?.trim() ?? "";
    }
    if (dto.middleName !== undefined) {
      payload.middleName = dto.middleName?.trim() || null;
    }
    if (dto.lastName !== undefined) {
      payload.lastName = dto.lastName?.trim() || null;
    }

    if (dto.name !== undefined && !dto.firstName) {
      const parts = dto.name?.trim().split(/\s+/) || [];
      payload.firstName = parts[0] ?? "";
      if (parts.length > 1 && !dto.lastName) {
        payload.lastName = parts.slice(1).join(" ");
      }
    }

    if (dto.phone !== undefined) {
      payload.phone = dto.phone?.trim() || null;
    }
    if (dto.nationality !== undefined) {
      payload.nationality = dto.nationality?.trim() || null;
    }
    if (dto.passportNumber !== undefined) {
      payload.passportNumber = dto.passportNumber?.trim() || null;
    }
    if (dto.passportExpiry !== undefined) {
      payload.passportExpiry = dto.passportExpiry?.trim() || null;
    }
    if (dto.dateOfBirth !== undefined) {
      payload.dateOfBirth = dto.dateOfBirth?.trim() || null;
    }
    if (dto.gender !== undefined) {
      const gender = dto.gender?.trim();
      payload.gender = gender ? (gender as User["gender"]) : null;
    }

    return payload;
  }

  private async resolveProfileUserId(
    authUserId: string,
    authEmail: string,
    dto: UpdateUserDto,
  ): Promise<string> {
    if (dto.id && dto.id !== authUserId) {
      throw new ForbiddenException("Cannot update another user's profile");
    }
    if (dto.userId && dto.userId !== authUserId) {
      throw new ForbiddenException("Cannot update another user's profile");
    }
    if (dto.email?.trim()) {
      const byEmail = await this.repository.findByEmail(dto.email);
      if (!byEmail || byEmail.id !== authUserId) {
        throw new ForbiddenException("Cannot update another user's profile");
      }
      return byEmail.id;
    }
    if (authUserId) {
      return authUserId;
    }
    const bySessionEmail = await this.repository.findByEmail(authEmail);
    if (!bySessionEmail) {
      throw new UnauthorizedException("Session invalid — please sign in again");
    }
    return bySessionEmail.id;
  }

  async updateProfile(
    authUserId: string,
    authEmail: string,
    dto: UpdateUserDto,
  ): Promise<UserPublicView> {
    const targetId = await this.resolveProfileUserId(
      authUserId,
      authEmail,
      dto,
    );

    const existing = await this.repository.findById(targetId);
    if (!existing) {
      throw new UnauthorizedException("Session invalid — please sign in again");
    }

    const payload = this.buildUpdatePayload(dto);

    const updated = await this.repository.update(targetId, payload);
    if (!updated) {
      throw new NotFoundException("User not found");
    }

    return this.getProfile(targetId);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserPublicView> {
    await this.findOne(id);

    const payload = this.buildUpdatePayload(dto);

    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new NotFoundException("User not found");
    }

    return this.findOne(id);
  }

  async updateByEmail(
    email: string,
    dto: UpdateUserDto,
  ): Promise<UserPublicView> {
    const row = await this.repository.findByEmail(email);
    if (!row) {
      throw new NotFoundException("User not found");
    }
    return this.update(row.id, dto);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException("User not found");
    }
    return { message: "Deleted successfully" };
  }

  async updatePassword(userId: string, currentPassword?: string, newPassword?: string): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user) throw new NotFoundException();

    if (user.passwordHash) {
      if (!currentPassword) {
        throw new ForbiddenException("Current password is required");
      }
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new ForbiddenException("Current password is incorrect");
      }
    }

    if (!newPassword) {
      throw new ForbiddenException("New password is required");
    }

    const newHash = await hashPassword(newPassword);
    await this.repository.updatePassword(userId, newHash);
  }

  async getRecentSearches(
    userId: string,
    limit = 8,
  ): Promise<RecentSearchEntity[]> {
    return this.recentSearchRepository.findByUserId(userId, limit);
  }

  async saveSearch(
    userId: string,
    data: {
      origin: string;
      destination: string;
      searchType: string;
      searchDate?: string;
      metadata?: any;
    },
  ): Promise<RecentSearchEntity | null> {
    return this.recentSearchRepository.create({
      userId,
      origin: data.origin || "",
      destination: data.destination || "",
      searchType: data.searchType,
      searchDate: data.searchDate ? new Date(data.searchDate) : null,
      metadata: data.metadata,
    });
  }

  async deleteRecentSearch(userId: string, id: string): Promise<boolean> {
    return this.recentSearchRepository.deleteById(userId, id);
  }

  async clearRecentSearches(userId: string): Promise<void> {
    return this.recentSearchRepository.deleteAllByUserId(userId);
  }
}
