import { Injectable } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { appLogger } from '../common/logging/winston';
import { PostgresClient } from './postgres.client';

@Injectable()
export class MigrationRunner {
  constructor(private readonly db: PostgresClient) {}

  /**
   * Run migrations.
   * @param only - If provided, only these filenames are applied (skips already-applied check).
   *               Useful for re-running a specific migration or applying out-of-band fixes.
   */
  async run(only?: string[]): Promise<void> {
    if (process.env.SKIP_MIGRATIONS === 'true' && !only) {
      appLogger.info('Migrations skipped (SKIP_MIGRATIONS=true)');
      return;
    }

    try {
      await this.db.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(100) PRIMARY KEY,
          applied_at TIMESTAMPTZ DEFAULT NOW()
        )`,
      );

      const migrationsPath = path.resolve(__dirname, '../../../../sql/migrations');
      let files = (await readdir(migrationsPath))
        .filter((file) => file.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));

      if (only && only.length > 0) {
        // Normalise: allow names with or without .sql extension
        const targets = only.map((f) => (f.endsWith('.sql') ? f : `${f}.sql`));
        const missing = targets.filter((t) => !files.includes(t));
        if (missing.length > 0) {
          throw new Error(`Migration files not found: ${missing.join(', ')}`);
        }
        files = targets;
        appLogger.info(`Running specific migrations: ${targets.join(', ')}`);
      }

      for (const file of files) {
        if (!only) {
          const exists = await this.db.queryOne<{ version: string }>(
            'SELECT version FROM schema_migrations WHERE version = $1 LIMIT 1',
            [file],
          );
          if (exists) continue;
        }

        const sql = await readFile(path.join(migrationsPath, file), 'utf8');

        await this.db.withTransaction(async (client) => {
          await client.query(sql);
          await client.query(
            `INSERT INTO schema_migrations (version) VALUES ($1)
             ON CONFLICT (version) DO UPDATE SET applied_at = NOW()`,
            [file],
          );
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
  // CLI usage:
  //   npm run migrate                          — run all pending migrations
  //   npm run migrate -- --only=001,002        — run specific migrations
  //   SKIP_MIGRATIONS=true npm run migrate     — no-op (useful for CI dry-runs)
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.replace('--only=', '').split(',').filter(Boolean) : undefined;

  const db = new PostgresClient();
  const runner = new MigrationRunner(db);

  runner
    .run(only)
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
