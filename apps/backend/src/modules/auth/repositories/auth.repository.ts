import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { IsNull, MoreThan, Repository } from "typeorm";
import { User, UserRole } from "../../user/entities/user.entity";
import {
  consumeOAuthExchangeCode,
  putOAuthExchangeCode,
} from "../utils/oauth-exchange-code.store";

export interface UserWithPasswordRow {
  id: string;
  email: string;
  passwordHash: string | null;
}

export interface RefreshTokenRow {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface TwoFactorRow {
  userId: string;
  secretCiphertext: string | null;
  pendingSecretCiphertext: string | null;
  enabled: boolean;
  backupCodesJson: string[];
}

const CUSTOMER_PERMISSIONS = [
  "trips.read",
  "trips.write",
  "bookings.read",
  "bookings.write",
];

const ADMIN_PERMISSIONS = [...CUSTOMER_PERMISSIONS, "admin.users"];

function parseBackupCodes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value as string[];
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findUserWithPasswordByEmail(
    email: string,
  ): Promise<UserWithPasswordRow | null> {
    const user = await this.userRepo
      .createQueryBuilder("u")
      .where("LOWER(u.email) = LOWER(:email)", { email })
      .getOne();
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
    };
  }

  async findUserByEmail(
    email: string,
  ): Promise<{ id: string; email: string } | null> {
    const user = await this.userRepo
      .createQueryBuilder("u")
      .where("LOWER(u.email) = LOWER(:email)", { email })
      .getOne();
    return user ? { id: user.id, email: user.email } : null;
  }

  async findUserById(id: string): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    preferredCurrency: string;
    role: string;
    phone: string | null;
  } | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      preferredCurrency: user.preferredCurrency,
      role: user.role,
      phone: user.phone,
    };
  }

  async insertUser(params: {
    email: string;
    passwordHash: string | null;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  }): Promise<{ id: string; email: string } | null> {
    const saved = await this.userRepo.save(
      this.userRepo.create({
        id: randomUUID(),
        email: params.email.trim().toLowerCase(),
        passwordHash: params.passwordHash,
        firstName: params.firstName,
        lastName: params.lastName,
        phone: params.phone ?? null,
        role: UserRole.USER,
      }),
    );
    return { id: saved.id, email: saved.email };
  }

  async insertOAuthUser(
    email: string,
    provider: string,
  ): Promise<{ id: string; email: string } | null> {
    const saved = await this.userRepo.save(
      this.userRepo.create({
        id: randomUUID(),
        email: email.trim().toLowerCase(),
        oauthProvider: provider,
        passwordHash: null,
        role: UserRole.USER,
      }),
    );
    return { id: saved.id, email: saved.email };
  }

  async assignRoleBySlug(userId: string, roleSlug: string): Promise<boolean> {
    const role =
      roleSlug === "admin" || roleSlug === "ADMIN"
        ? UserRole.ADMIN
        : UserRole.USER;
    const result = await this.userRepo.update(userId, { role });
    return (result.affected ?? 0) > 0;
  }

  async getRoleSlugsForUser(userId: string): Promise<string[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role === UserRole.ADMIN) {
      return ["admin"];
    }
    if (user?.role === UserRole.SUB_ADMIN) {
      return ["sub-admin"];
    }
    return ["customer"];
  }

  async getPermissionSlugsForUser(userId: string): Promise<string[]> {
    const roles = await this.getRoleSlugsForUser(userId);
    return roles.includes("admin") ? ADMIN_PERMISSIONS : CUSTOMER_PERMISSIONS;
  }

  async findOAuthAccount(
    provider: string,
    providerUserId: string,
  ): Promise<{ userId: string } | null> {
    const user = await this.userRepo.findOne({
      where: { oauthProvider: provider, oauthProviderUserId: providerUserId },
      select: { id: true },
    });
    return user ? { userId: user.id } : null;
  }

  async tryInsertOAuthAccount(
    userId: string,
    provider: string,
    providerUserId: string,
  ): Promise<boolean> {
    const existing = await this.findOAuthAccount(provider, providerUserId);
    if (existing) {
      return existing.userId === userId;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return false;
    }

    await this.userRepo.update(userId, {
      oauthProvider: user.oauthProvider ?? provider,
      oauthProviderUserId: user.oauthProviderUserId ?? providerUserId,
    });
    return true;
  }

  async getUserEmailById(id: string): Promise<string | null> {
    const user = await this.userRepo.findOne({
      where: { id },
      select: { email: true },
    });
    return user?.email ?? null;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.userRepo.update(userId, { passwordHash });
  }

  async updateOAuthProvider(userId: string, provider: string): Promise<void> {
    await this.userRepo.update(userId, { oauthProvider: provider });
  }

  async insertRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<{ id: string } | null> {
    const tokenId = randomUUID();
    await this.userRepo.update(params.userId, {
      refreshTokenHash: params.tokenHash,
      refreshTokenExpiresAt: params.expiresAt,
      refreshTokenRevokedAt: null,
    });
    return { id: tokenId };
  }

  async findActiveRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRow | null> {
    const user = await this.userRepo.findOne({
      where: {
        refreshTokenHash: tokenHash,
        refreshTokenRevokedAt: IsNull(),
        refreshTokenExpiresAt: MoreThan(new Date()),
      },
      select: {
        id: true,
        refreshTokenExpiresAt: true,
      },
    });
    return user && user.refreshTokenExpiresAt
      ? {
          id: user.id,
          userId: user.id,
          expiresAt: user.refreshTokenExpiresAt,
        }
      : null;
  }

  async revokeRefreshToken(
    id: string,
    _replacedById: string | null,
  ): Promise<void> {
    await this.userRepo.update(id, { refreshTokenRevokedAt: new Date() });
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenRevokedAt: new Date() });
  }

  async findTwoFactor(userId: string): Promise<TwoFactorRow | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (
      !user ||
      (!user.twoFactorEnabled &&
        !user.twoFactorSecretCiphertext &&
        !user.twoFactorPendingSecretCiphertext)
    ) {
      return null;
    }
    return {
      userId: user.id,
      secretCiphertext: user.twoFactorSecretCiphertext,
      pendingSecretCiphertext: user.twoFactorPendingSecretCiphertext,
      enabled: user.twoFactorEnabled,
      backupCodesJson: parseBackupCodes(user.twoFactorBackupCodes),
    };
  }

  async upsertTwoFactorPending(
    userId: string,
    pendingCipher: string,
  ): Promise<void> {
    await this.userRepo.update(userId, {
      twoFactorPendingSecretCiphertext: pendingCipher,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
    });
  }

  async finalizeTwoFactor(
    userId: string,
    secretCipher: string,
    backupHashes: string[],
  ): Promise<void> {
    await this.userRepo.update(userId, {
      twoFactorSecretCiphertext: secretCipher,
      twoFactorPendingSecretCiphertext: null,
      twoFactorEnabled: true,
      twoFactorBackupCodes: backupHashes,
    });
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      twoFactorSecretCiphertext: null,
      twoFactorPendingSecretCiphertext: null,
      twoFactorEnabled: false,
      twoFactorBackupCodes: [],
    });
  }

  async removeBackupCode(
    userId: string,
    remainingHashes: string[],
  ): Promise<void> {
    await this.userRepo.update(userId, {
      twoFactorBackupCodes: remainingHashes,
    });
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return user?.twoFactorEnabled === true;
  }

  async insertOAuthExchangeCode(params: {
    code: string;
    userId: string;
    expiresAt: Date;
  }): Promise<void> {
    putOAuthExchangeCode(params.code, params.userId, params.expiresAt);
  }

  async consumeOAuthExchangeCode(
    code: string,
  ): Promise<{ userId: string } | null> {
    return consumeOAuthExchangeCode(code);
  }

  async insertPasswordResetOtp(
    userId: string,
    otpHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepo.update(userId, {
      passwordResetOtpId: randomUUID(),
      passwordResetOtpHash: otpHash,
      passwordResetOtpExpiresAt: expiresAt,
    });
  }

  async findActivePasswordResetOtp(
    userId: string,
    otpHash: string,
  ): Promise<{ id: string } | null> {
    const user = await this.userRepo.findOne({
      where: {
        id: userId,
        passwordResetOtpHash: otpHash,
        passwordResetOtpExpiresAt: MoreThan(new Date()),
      },
      select: { passwordResetOtpId: true },
    });
    return user?.passwordResetOtpId ? { id: user.passwordResetOtpId } : null;
  }

  async consumePasswordResetOtp(id: string): Promise<boolean> {
    const result = await this.userRepo.update(
      { passwordResetOtpId: id },
      {
        passwordResetOtpId: null,
        passwordResetOtpHash: null,
        passwordResetOtpExpiresAt: null,
      },
    );
    return (result.affected ?? 0) > 0;
  }

  async updatePasswordByEmail(
    email: string,
    passwordHash: string,
  ): Promise<boolean> {
    const user = await this.userRepo
      .createQueryBuilder("u")
      .where("LOWER(u.email) = LOWER(:email)", { email })
      .getOne();
    if (!user) {
      return false;
    }
    await this.userRepo.update(user.id, { passwordHash });
    return true;
  }
}
