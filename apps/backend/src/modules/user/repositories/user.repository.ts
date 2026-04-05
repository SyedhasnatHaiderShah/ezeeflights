import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PostgresClient) {}

  findById(id: string): Promise<UserEntity | null> {
    return this.db.queryOne<UserEntity>(
      `SELECT
         id,
         email,
         first_name as "firstName",
         last_name as "lastName",
         preferred_currency as "preferredCurrency",
         created_at as "createdAt"
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
  }
}
