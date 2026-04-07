import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { UserRecord } from '../entities/user.entity';

const USER_COLUMNS = `id,
  email,
  first_name as "firstName",
  last_name as "lastName",
  preferred_currency as "preferredCurrency",
  phone,
  role,
  nationality,
  passport_number as "passportNumber",
  passport_expiry as "passportExpiry",
  created_at as "createdAt",
  updated_at as "updatedAt"`;

@Injectable()
export class UserRepository {
  constructor(private readonly db: PostgresClient) {}

  findById(id: string): Promise<UserRecord | null> {
    return this.db.queryOne<UserRecord>(
      `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
      [id],
    );
  }

  findByEmail(email: string): Promise<{ id: string } | null> {
    return this.db.queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
  }

  findAll(): Promise<UserRecord[]> {
    return this.db.query<UserRecord>(`SELECT ${USER_COLUMNS} FROM users ORDER BY created_at DESC`);
  }

  async create(row: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    role: string;
    nationality: string | null;
    passportNumber: string | null;
    passportExpiry: string | null;
  }): Promise<UserRecord | null> {
    return this.db.queryOne<UserRecord>(
      `INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        role,
        nationality,
        passport_number,
        passport_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date)
      RETURNING ${USER_COLUMNS}`,
      [
        row.email,
        row.passwordHash,
        row.firstName,
        row.lastName,
        row.phone,
        row.role,
        row.nationality,
        row.passportNumber,
        row.passportExpiry,
      ],
    );
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string | null;
      phone?: string | null;
      nationality?: string | null;
      passportNumber?: string | null;
      passportExpiry?: string | null;
    },
  ): Promise<boolean> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.firstName !== undefined) {
      sets.push(`first_name = $${i++}`);
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      sets.push(`last_name = $${i++}`);
      values.push(data.lastName);
    }
    if (data.phone !== undefined) {
      sets.push(`phone = $${i++}`);
      values.push(data.phone);
    }
    if (data.nationality !== undefined) {
      sets.push(`nationality = $${i++}`);
      values.push(data.nationality);
    }
    if (data.passportNumber !== undefined) {
      sets.push(`passport_number = $${i++}`);
      values.push(data.passportNumber);
    }
    if (data.passportExpiry !== undefined) {
      sets.push(`passport_expiry = $${i++}::date`);
      values.push(data.passportExpiry);
    }

    if (sets.length === 0) {
      return this.findById(id).then((u) => !!u);
    }

    sets.push('updated_at = NOW()');
    values.push(id);
    const result = await this.db.query<{ id: string }>(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING id`,
      values,
    );
    return result.length > 0;
  }

  async deleteById(id: string): Promise<boolean> {
    const row = await this.db.queryOne<{ id: string }>('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return !!row;
  }
}
