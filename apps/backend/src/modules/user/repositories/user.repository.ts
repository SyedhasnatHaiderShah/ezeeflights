import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole, UserRecord } from "../entities/user.entity";
import { randomUUID } from "crypto";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.repo.findOne({ where: { id } });
    return user ? this.mapToRecord(user) : null;
  }

  async findByEmail(email: string): Promise<{ id: string; email: string } | null> {
    const user = await this.repo
      .createQueryBuilder("u")
      .select(["u.id", "u.email"])
      .where("LOWER(u.email) = LOWER(:email)", { email: email.trim() })
      .getOne();
    return user ? { id: user.id, email: user.email } : null;
  }

  async findAll(): Promise<UserRecord[]> {
    const users = await this.repo.find({ order: { createdAt: "DESC" } });
    return users.map((u) => this.mapToRecord(u));
  }

  async create(row: {
    id?: string;
    email: string;
    passwordHash: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: UserRole;
    nationality: string | null;
    passportNumber: string | null;
    passportExpiry: string | null;
    oauthProvider?: string | null;
  }): Promise<UserRecord | null> {
    return this.upsertFromAuth({
      ...row,
      id: row.id || randomUUID(),
    });
  }

  /** Insert or update user row (admin-created accounts). */
  async upsertFromAuth(row: {
    id: string;
    email: string;
    passwordHash?: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: UserRole;
    nationality: string | null;
    passportNumber: string | null;
    passportExpiry: string | null;
    oauthProvider?: string | null;
  }): Promise<UserRecord | null> {
    const email = row.email.trim().toLowerCase();
    const byEmail = await this.repo.findOne({ where: { email } });
    if (byEmail && byEmail.id !== row.id) {
      await this.repo.delete(byEmail.id);
    }
    const existing = await this.repo.findOne({ where: { id: row.id } });

    const entity = existing ?? this.repo.create({ id: row.id });
    entity.email = email;
    entity.firstName = row.firstName;
    entity.lastName = row.lastName;
    entity.phone = row.phone;
    entity.role = row.role;
    entity.nationality = row.nationality;
    entity.passportNumber = row.passportNumber;
    entity.passportExpiry = row.passportExpiry
      ? new Date(row.passportExpiry)
      : null;

    if (row.oauthProvider !== undefined) {
      entity.oauthProvider = row.oauthProvider;
    }

    if (row.passwordHash !== undefined && row.passwordHash !== "") {
      entity.passwordHash = row.passwordHash;
    } else if (!existing) {
      entity.passwordHash = null;
    }

    const saved = await this.repo.save(entity);
    return this.mapToRecord(saved);
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      middleName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      nationality?: string | null;
      passportNumber?: string | null;
      passportExpiry?: string | null;
      dateOfBirth?: string | null;
      gender?: User["gender"];
    },
  ): Promise<boolean> {
    const updateData: Partial<User> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.middleName !== undefined) updateData.middleName = data.middleName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.nationality !== undefined)
      updateData.nationality = data.nationality;
    if (data.passportNumber !== undefined)
      updateData.passportNumber = data.passportNumber;
    if (data.passportExpiry !== undefined) {
      updateData.passportExpiry =
        data.passportExpiry && data.passportExpiry !== ""
          ? new Date(data.passportExpiry)
          : null;
    }
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth =
        data.dateOfBirth && data.dateOfBirth !== ""
          ? new Date(data.dateOfBirth)
          : null;
    }
    if (data.gender !== undefined) updateData.gender = data.gender;

    if (Object.keys(updateData).length === 0) {
      return this.findById(id).then((u) => !!u);
    }

    try {
      const result = await this.repo.update(id, updateData as any);
      return (result.affected ?? 0) > 0;
    } catch (err: any) {
      // MySQL unique constraint violation
      if (err?.code === "ER_DUP_ENTRY") {
        if (err?.message?.toLowerCase().includes("phone")) {
          throw new ConflictException("Phone number is already in use by another account");
        }
        throw new ConflictException("A duplicate value was detected — please check your details");
      }
      throw err;
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<boolean> {
    const result = await this.repo.update(id, { passwordHash });
    return (result.affected ?? 0) > 0;
  }

  async updateByEmail(
    email: string,
    data: Parameters<UserRepository["update"]>[1],
  ): Promise<boolean> {
    const row = await this.findByEmail(email);
    if (!row) {
      return false;
    }
    return this.update(row.id, data);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private mapToRecord(user: User): UserRecord {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      oauthProvider: user.oauthProvider,
      preferredCurrency: user.preferredCurrency,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      role: user.role,
      nationality: user.nationality,
      passportNumber: user.passportNumber,
      passportExpiry: user.passportExpiry,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
