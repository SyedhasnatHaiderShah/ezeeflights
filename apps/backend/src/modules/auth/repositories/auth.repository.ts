import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';

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

@Injectable()
export class AuthRepository {
  constructor(private readonly db: PostgresClient) {}

  async findUserWithPasswordByEmail(email: string): Promise<UserWithPasswordRow | null> {
    return this.db.queryOne<UserWithPasswordRow>(
      `SELECT id, email, password_hash as "passwordHash"
       FROM users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
  }

  async findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    return this.db.queryOne<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE lower(email) = lower($1) LIMIT 1',
      [email],
    );
  }

  async findUserById(id: string): Promise<{
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    preferredCurrency: string;
    role: string;
  } | null> {
    return this.db.queryOne(
      `SELECT
         id,
         email,
         first_name as "firstName",
         last_name as "lastName",
         preferred_currency as "preferredCurrency",
         role
       FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );
  }

  async insertUser(params: {
    email: string;
    passwordHash: string | null;
    firstName: string | null;
    lastName: string | null;
  }): Promise<{ id: string; email: string } | null> {
    return this.db.queryOne<{ id: string; email: string }>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [params.email, params.passwordHash, params.firstName, params.lastName],
    );
  }

  async insertOAuthUser(email: string, provider: string): Promise<{ id: string; email: string } | null> {
    return this.db.queryOne<{ id: string; email: string }>(
      `INSERT INTO users (email, oauth_provider)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, provider],
    );
  }

  async assignRoleBySlug(userId: string, roleSlug: string): Promise<boolean> {
    const row = await this.db.queryOne<{ userId: string }>(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT $1, r.id FROM roles r WHERE r.slug = $2
       ON CONFLICT DO NOTHING
       RETURNING user_id as "userId"`,
      [userId, roleSlug],
    );
    if (row) {
      return true;
    }
    const exists = await this.db.queryOne<{ one: number }>(
      `SELECT 1 as one FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1 AND r.slug = $2`,
      [userId, roleSlug],
    );
    return !!exists;
  }

  async getRoleSlugsForUser(userId: string): Promise<string[]> {
    const rows = await this.db.query<{ slug: string }>(
      `SELECT r.slug
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );
    if (rows.length > 0) {
      return rows.map((r) => r.slug);
    }
    const legacy = await this.db.queryOne<{ role: string }>('SELECT role FROM users WHERE id = $1', [userId]);
    if (legacy?.role === 'ADMIN' || legacy?.role === 'admin') {
      return ['admin'];
    }
    return ['customer'];
  }

  async getPermissionSlugsForUser(userId: string): Promise<string[]> {
    const rows = await this.db.query<{ slug: string }>(
      `SELECT DISTINCT p.slug
       FROM user_roles ur
       JOIN role_permissions rp ON rp.role_id = ur.role_id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1`,
      [userId],
    );
    return rows.map((r) => r.slug);
  }

  async findOAuthAccount(
    provider: string,
    providerUserId: string,
  ): Promise<{ userId: string } | null> {
    return this.db.queryOne<{ userId: string }>(
      `SELECT user_id as "userId" FROM oauth_accounts
       WHERE provider = $1 AND provider_user_id = $2 LIMIT 1`,
      [provider, providerUserId],
    );
  }

  async tryInsertOAuthAccount(userId: string, provider: string, providerUserId: string): Promise<boolean> {
    const row = await this.db.queryOne<{ id: string }>(
      `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_user_id) DO NOTHING
       RETURNING id`,
      [userId, provider, providerUserId],
    );
    return !!row;
  }

  async getUserEmailById(id: string): Promise<string | null> {
    const row = await this.db.queryOne<{ email: string }>('SELECT email FROM users WHERE id = $1', [id]);
    return row?.email ?? null;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.db.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
      passwordHash,
      userId,
    ]);
  }

  async insertRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [params.userId, params.tokenHash, params.expiresAt, params.ipAddress, params.userAgent],
    );
  }

  async findActiveRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    return this.db.queryOne<RefreshTokenRow>(
      `SELECT id, user_id as "userId", expires_at as "expiresAt"
       FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash],
    );
  }

  async revokeRefreshToken(id: string, replacedById: string | null): Promise<void> {
    await this.db.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW(), replaced_by_id = COALESCE($2, replaced_by_id)
       WHERE id = $1`,
      [id, replacedById],
    );
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.db.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [
      userId,
    ]);
  }

  async findTwoFactor(userId: string): Promise<TwoFactorRow | null> {
    const row = await this.db.queryOne<{
      userId: string;
      secretCiphertext: string | null;
      pendingSecretCiphertext: string | null;
      enabled: boolean;
      backupCodesJson: unknown;
    }>(
      `SELECT
         user_id as "userId",
         secret_ciphertext as "secretCiphertext",
         pending_secret_ciphertext as "pendingSecretCiphertext",
         enabled,
         backup_codes_json as "backupCodesJson"
       FROM user_two_factor
       WHERE user_id = $1`,
      [userId],
    );
    if (!row) {
      return null;
    }
    const codes = Array.isArray(row.backupCodesJson)
      ? (row.backupCodesJson as string[])
      : typeof row.backupCodesJson === 'string'
        ? (JSON.parse(row.backupCodesJson) as string[])
        : [];
    return {
      userId: row.userId,
      secretCiphertext: row.secretCiphertext,
      pendingSecretCiphertext: row.pendingSecretCiphertext,
      enabled: row.enabled,
      backupCodesJson: codes,
    };
  }

  async upsertTwoFactorPending(userId: string, pendingCipher: string): Promise<void> {
    await this.db.query(
      `INSERT INTO user_two_factor (user_id, pending_secret_ciphertext, enabled, backup_codes_json)
       VALUES ($1, $2, false, '[]'::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET
         pending_secret_ciphertext = EXCLUDED.pending_secret_ciphertext,
         updated_at = NOW()`,
      [userId, pendingCipher],
    );
  }

  async finalizeTwoFactor(userId: string, secretCipher: string, backupHashes: string[]): Promise<void> {
    await this.db.query(
      `INSERT INTO user_two_factor (user_id, secret_ciphertext, pending_secret_ciphertext, enabled, backup_codes_json)
       VALUES ($1, $2, NULL, true, $3::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET
         secret_ciphertext = EXCLUDED.secret_ciphertext,
         pending_secret_ciphertext = NULL,
         enabled = true,
         backup_codes_json = EXCLUDED.backup_codes_json,
         updated_at = NOW()`,
      [userId, secretCipher, JSON.stringify(backupHashes)],
    );
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.db.query(
      `UPDATE user_two_factor
       SET secret_ciphertext = NULL,
           pending_secret_ciphertext = NULL,
           enabled = false,
           backup_codes_json = '[]'::jsonb,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId],
    );
  }

  async removeBackupCode(userId: string, remainingHashes: string[]): Promise<void> {
    await this.db.query(
      `UPDATE user_two_factor SET backup_codes_json = $2::jsonb, updated_at = NOW() WHERE user_id = $1`,
      [userId, JSON.stringify(remainingHashes)],
    );
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const row = await this.db.queryOne<{ enabled: boolean }>(
      'SELECT enabled FROM user_two_factor WHERE user_id = $1',
      [userId],
    );
    return row?.enabled === true;
  }

  async insertOAuthExchangeCode(params: { code: string; userId: string; expiresAt: Date }): Promise<void> {
    await this.db.query(
      `INSERT INTO oauth_exchange_codes (code, user_id, expires_at) VALUES ($1, $2, $3)`,
      [params.code, params.userId, params.expiresAt],
    );
  }

  async consumeOAuthExchangeCode(code: string): Promise<{ userId: string } | null> {
    return this.db.queryOne<{ userId: string }>(
      `UPDATE oauth_exchange_codes
       SET consumed_at = NOW()
       WHERE code = $1 AND consumed_at IS NULL AND expires_at > NOW()
       RETURNING user_id as "userId"`,
      [code],
    );
  }

  async insertPasswordResetOtp(params: { email: string; code: string; expiresAt: Date }): Promise<void> {
    await this.db.query(
      `INSERT INTO password_reset_otps (email, code, expires_at) VALUES ($1, $2, $3)`,
      [params.email, params.code, params.expiresAt],
    );
  }

  async findActivePasswordResetOtp(email: string, code: string): Promise<boolean> {
    const row = await this.db.queryOne<{ one: number }>(
      `SELECT 1 as one FROM password_reset_otps
       WHERE lower(email) = lower($1) AND code = $2 AND consumed_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [email, code],
    );
    return !!row;
  }

  async consumePasswordResetOtp(email: string, code: string): Promise<boolean> {
    const row = await this.db.queryOne<{ id: string }>(
      `UPDATE password_reset_otps
       SET consumed_at = NOW()
       WHERE lower(email) = lower($1) AND code = $2 AND consumed_at IS NULL AND expires_at > NOW()
       RETURNING id`,
      [email, code],
    );
    return !!row;
  }

  async updatePasswordByEmail(email: string, passwordHash: string): Promise<boolean> {
    const row = await this.db.queryOne<{ id: string }>(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE lower(email) = lower($2) RETURNING id`,
      [passwordHash, email],
    );
    return !!row;
  }
}
