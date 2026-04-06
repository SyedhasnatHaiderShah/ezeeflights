import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hashPassword } from '../../../common/crypto/password';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserPublicView, UserRecord } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

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
    const parts = [row.firstName, row.lastName].filter((p): p is string => !!p?.trim());
    const name = parts.join(' ').trim() || row.firstName?.trim() || '';
    return {
      id: row.id,
      email: row.email,
      name: name || row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      preferredCurrency: row.preferredCurrency,
      phone: row.phone,
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
      throw new NotFoundException('User profile not found');
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
      throw new NotFoundException('User not found');
    }
    return this.toPublicView(user);
  }

  async create(dto: CreateUserDto): Promise<UserPublicView> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passportExpiry = dto.passportExpiry?.trim() || null;
    const row = await this.repository.create({
      email: dto.email.trim().toLowerCase(),
      passwordHash: await hashPassword(dto.password),
      firstName: dto.name.trim(),
      lastName: null,
      phone: dto.phone?.trim() || null,
      role: dto.role?.trim() || 'USER',
      nationality: dto.nationality?.trim() || null,
      passportNumber: dto.passportNumber?.trim() || null,
      passportExpiry,
    });

    if (!row) {
      throw new NotFoundException('Failed to create user');
    }

    return this.toPublicView(row);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserPublicView> {
    await this.findOne(id);

    const payload: Parameters<UserRepository['update']>[1] = {};

    if (dto.name !== undefined) {
      payload.firstName = dto.name.trim();
    }
    if (dto.phone !== undefined) {
      payload.phone = dto.phone.trim() || null;
    }
    if (dto.nationality !== undefined) {
      payload.nationality = dto.nationality.trim() || null;
    }
    if (dto.passportNumber !== undefined) {
      payload.passportNumber = dto.passportNumber.trim() || null;
    }
    if (dto.passportExpiry !== undefined) {
      payload.passportExpiry = dto.passportExpiry.trim() || null;
    }

    const updated = await this.repository.update(id, payload);
    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    const deleted = await this.repository.deleteById(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
    return { message: 'Deleted successfully' };
  }
}
