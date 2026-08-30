import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PostgresClient } from '../src/database/postgres.client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const db = app.get(PostgresClient);

  console.log('Running migration to add pricing columns...');
  try {
    await db.query(`
      ALTER TABLE flights 
      ADD COLUMN IF NOT EXISTS tax NUMERIC, 
      ADD COLUMN IF NOT EXISTS total_fare NUMERIC, 
      ADD COLUMN IF NOT EXISTS raw_segments JSONB;
    `);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await app.close();
  }
}

bootstrap();
