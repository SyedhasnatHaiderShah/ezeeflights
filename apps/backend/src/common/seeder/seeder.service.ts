import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { hashPassword } from '../crypto/password';

interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@ezeeflights.com',
    password: 'Admin@123456',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  {
    email: 'user1@ezeeflights.com',
    password: 'User1@123456',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'user',
  },
  {
    email: 'user2@ezeeflights.com',
    password: 'User2@123456',
    firstName: 'Bob',
    lastName: 'Smith',
    role: 'user',
  },
];

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly db: PostgresClient) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedUsers();
  }

  private async seedUsers(): Promise<void> {
    for (const user of SEED_USERS) {
      const existing = await this.db.queryOne<{ id: string }>(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [user.email],
      );

      if (existing) {
        this.logger.log(`Seed user already exists: ${user.email}`);
        continue;
      }

      const passwordHash = await hashPassword(user.password);

      await this.db.queryOne(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user.email, passwordHash, user.firstName, user.lastName, user.role],
      );

      this.logger.log(`Seed user created: ${user.email} (${user.role})`);
    }
  }
}
