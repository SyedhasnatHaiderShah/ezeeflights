import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUB_ADMIN = "SUB-ADMIN",
  SUPPORT = "SUPPORT",
  FINANCE = "FINANCE",
  MARKETING = "MARKETING",
}

@Entity({ database: "worldrix_ezeecrm", name: "tbl_users" })
export class User {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ name: "password_hash", type: "text", nullable: true })
  passwordHash: string | null;

  @Column({ name: "first_name", type: "varchar", length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: "middle_name", type: "varchar", length: 100, nullable: true })
  middleName: string | null;

  @Column({ name: "last_name", type: "varchar", length: 100, nullable: true })
  lastName: string | null;

  @Column({
    name: "oauth_provider",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  oauthProvider: string | null;

  @Column({
    name: "oauth_provider_user_id",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  oauthProviderUserId: string | null;

  @Column({
    name: "refresh_token_hash",
    type: "varchar",
    length: 64,
    nullable: true,
  })
  refreshTokenHash: string | null;

  @Column({
    name: "refresh_token_expires_at",
    type: "timestamp",
    nullable: true,
  })
  refreshTokenExpiresAt: Date | null;

  @Column({
    name: "refresh_token_revoked_at",
    type: "timestamp",
    nullable: true,
  })
  refreshTokenRevokedAt: Date | null;

  @Column({
    name: "preferred_currency",
    type: "varchar",
    length: 3,
    default: "USD",
  })
  preferredCurrency: "USD" | "AED" | "EUR" | "GBP";

  @Column({ type: "varchar", length: 20, nullable: true, unique: true })
  phone: string | null;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  gender: "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED" | null;

  @Column({ type: "varchar", length: 20, default: "USER" })
  role: UserRole;

  @Column({ type: "varchar", length: 50, nullable: true })
  nationality: string | null;

  @Column({
    name: "passport_number",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  passportNumber: string | null;

  @Column({ name: "passport_expiry", type: "date", nullable: true })
  passportExpiry: Date | null;

  @Column({ name: "two_factor_enabled", type: "boolean", default: false })
  twoFactorEnabled: boolean;

  @Column({ name: "two_factor_secret_ciphertext", type: "text", nullable: true })
  twoFactorSecretCiphertext: string | null;

  @Column({
    name: "two_factor_pending_secret_ciphertext",
    type: "text",
    nullable: true,
  })
  twoFactorPendingSecretCiphertext: string | null;

  @Column({ name: "two_factor_backup_codes", type: "json", nullable: true })
  twoFactorBackupCodes: string[] | null;

  @Column({
    name: "password_reset_otp_id",
    type: "varchar",
    length: 36,
    nullable: true,
  })
  passwordResetOtpId: string | null;

  @Column({
    name: "password_reset_otp_hash",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  passwordResetOtpHash: string | null;

  @Column({
    name: "password_reset_otp_expires_at",
    type: "timestamp",
    nullable: true,
  })
  passwordResetOtpExpiresAt: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt: Date;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash?: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  oauthProvider: string | null;
  preferredCurrency: "USD" | "AED" | "EUR" | "GBP";
  phone: string | null;
  dateOfBirth: Date | null;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED" | null;
  role: UserRole;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicView {
  id: string;
  email: string;
  name: string;
  hasPassword?: boolean;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  oauthProvider: string | null;
  preferredCurrency: "USD" | "AED" | "EUR" | "GBP";
  phone: string | null;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED" | null;
  role: UserRole;
  nationality: string | null;
  passportNumber: string | null;
  passportExpiry: string | null;
  createdAt: Date;
  updatedAt: Date;
}
