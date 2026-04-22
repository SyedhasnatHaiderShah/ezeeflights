import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { REVIEWS as PUBLIC_REVIEWS_SEED } from '../../../frontend/data/reviews';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in apps/backend/.env');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const tableExists = await pool.query(`SELECT to_regclass('public.public_reviews') AS exists`);
    const tableName = tableExists.rows[0]?.exists as string | null | undefined;

    if (!tableName) {
      throw new Error('Table public_reviews does not exist. Run migrations first: npm run migrate');
    }

    await pool.query('BEGIN');

    for (let i = 0; i < PUBLIC_REVIEWS_SEED.length; i++) {
      const review = PUBLIC_REVIEWS_SEED[i];
      const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(review.name)}`;

      await pool.query('DELETE FROM public_reviews WHERE author_name = $1 AND text = $2', [review.name, review.text]);

      await pool.query(
        `INSERT INTO public_reviews (author_name, author_avatar, author_location, rating, text, is_verified, category, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date)`,
        [review.name, avatar, review.location, review.rating, review.text, true, 'flight-booking', review.date],
      );
    }

    await pool.query('COMMIT');
    console.log(`✅ Seeded ${PUBLIC_REVIEWS_SEED.length} public reviews.`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Public reviews seed failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
