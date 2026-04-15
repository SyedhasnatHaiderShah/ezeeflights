import { Injectable } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import * as path from 'path';
import { appLogger } from '../common/logging/winston';
import { PostgresClient } from './postgres.client';

@Injectable()
export class MigrationRunner {
  constructor(private readonly db: PostgresClient) {}

  async run(): Promise<void> {
    try {
      await this.db.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(100) PRIMARY KEY,
          applied_at TIMESTAMPTZ DEFAULT NOW()
        )`,
      );

      const migrationsPath = path.resolve(__dirname, '../../../../sql/migrations');
      const files = (await readdir(migrationsPath))
        .filter((file) => file.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));

      for (const file of files) {
        const exists = await this.db.queryOne<{ version: string }>(
          'SELECT version FROM schema_migrations WHERE version = $1 LIMIT 1',
          [file],
        );

        if (exists) {
          continue;
        }

        const sql = await readFile(path.join(migrationsPath, file), 'utf8');

        await this.db.withTransaction(async (client) => {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        });

        appLogger.info(`Applied migration: ${file}`);
      }
    } catch (error) {
      const err = error as Error;
      appLogger.error('Migration runner failed', { message: err.message, stack: err.stack });
      throw error;
    }
  }
}

if (require.main === module) {
  const db = new PostgresClient();
  const runner = new MigrationRunner(db);

  runner
    .run()
    .then(async () => {
      appLogger.info('Migrations completed');
      await db.onModuleDestroy();
      process.exit(0);
    })
    .catch(async () => {
      await db.onModuleDestroy();
      process.exit(1);
    });
}
