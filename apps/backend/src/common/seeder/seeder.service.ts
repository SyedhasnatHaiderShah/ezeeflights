import { Injectable, Logger } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { hashPassword } from '../crypto/password';

interface SeedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
}

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly db: PostgresClient) {}

  async seedUsers(): Promise<void> {
    const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? (isDevelopment ? 'Admin@123456' : null);
    const userPassword = process.env.SEED_USER_PASSWORD ?? (isDevelopment ? 'User1@123456' : null);

    if (!adminPassword || !userPassword) {
      throw new Error('SEED_ADMIN_PASSWORD and SEED_USER_PASSWORD must be set outside development');
    }

    const adminEmail = (process.env.ADMIN_EMAILS ?? 'admin@ezeeflights.com').split(',')[0]?.trim();
    const seedUsers: SeedUser[] = [
      { email: adminEmail, password: adminPassword, firstName: 'Admin', lastName: 'User', role: 'admin' },
      { email: 'user1@ezeeflights.com', password: userPassword, firstName: 'Alice', lastName: 'Johnson', role: 'customer' },
      { email: 'user2@ezeeflights.com', password: userPassword, firstName: 'Bob', lastName: 'Smith', role: 'customer' },
    ];

    const existingAdmin = await this.db.queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1 LIMIT 1', [adminEmail]);
    if (existingAdmin) {
      this.logger.log('Seed data already present; skipping user seed');
      return;
    }

    for (const user of seedUsers) {
      const existing = await this.db.queryOne<{ id: string }>(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [user.email],
      );

      if (existing) {
        this.logger.log(`Seed user already exists: ${user.email}`);
        continue;
      }

      const passwordHash = await hashPassword(user.password);
      const createdUser = await this.db.queryOne<{ id: string }>(
        `INSERT INTO users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user.email, passwordHash, user.firstName, user.lastName, user.role],
      );

      const role = await this.db.queryOne<{ id: string }>('SELECT id FROM roles WHERE slug = $1 LIMIT 1', [user.role]);
      if (role && createdUser) {
        await this.db.query(
          `INSERT INTO user_roles (user_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, role_id) DO NOTHING`,
          [createdUser.id, role.id],
        );
      }

      this.logger.log(`Seed user created: ${user.email} (${user.role})`);
    }
  }
}
